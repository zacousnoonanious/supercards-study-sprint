import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { CollaborativeUser, PresenceState } from './types';

interface UsePresenceManagerProps {
  setId: string;
  cardId?: string;
  isCollaborative: boolean;
}

export const usePresenceManager = ({ setId, cardId, isCollaborative }: UsePresenceManagerProps) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Early return if conditions aren't met, but don't call hooks conditionally
    if (!user || !setId || !isCollaborative) {
      // Clean up existing connections if conditions change
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setActiveUsers([]);
      return;
    }

    const initializePresence = async () => {
      try {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' : 'Anonymous User';

        // Clean up existing channel before creating new one
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
        }

        // Set up realtime channel
        const channel = supabase.channel(`set-${setId}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        // Track user presence
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState() as PresenceState;
            const users: CollaborativeUser[] = [];
            
            Object.keys(state).forEach((userId) => {
              const presences = state[userId];
              if (presences && presences.length > 0) {
                const presence = presences[0];
                users.push({
                  id: userId,
                  name: presence.user_name || 'Anonymous User',
                  avatar: presence.user_avatar || null,
                  cursor_position: presence.cursor_position,
                  card_id: presence.card_id,
                  last_seen: presence.last_seen || new Date().toISOString(),
                });
              }
            });
            
            setActiveUsers(users.filter(u => u.id !== user.id));
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', key, newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', key, leftPresences);
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'flashcards',
            filter: `set_id=eq.${setId}`,
          }, (payload) => {
            console.log('Flashcard change:', payload);
          });

        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track current user presence
            await channel.track({
              user_id: user.id,
              user_name: userName,
              user_avatar: profile?.avatar_url || null,
              card_id: cardId || null,
              last_seen: new Date().toISOString(),
            });
          }
        });

        channelRef.current = channel;

        // Clean up existing heartbeat before setting new one
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Set up heartbeat to keep session alive
        const heartbeat = setInterval(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              user_id: user.id,
              user_name: userName,
              user_avatar: profile?.avatar_url || null,
              card_id: cardId || null,
              last_seen: new Date().toISOString(),
            });
          }
        }, 30000); // Update every 30 seconds

        heartbeatIntervalRef.current = heartbeat;
      } catch (error) {
        console.error('Error initializing presence:', error);
      }
    };

    initializePresence();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user, setId, cardId, isCollaborative]);

  const updateUserPosition = async (cardId: string | null, cursorPosition?: any) => {
    if (channelRef.current && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' : 'Anonymous User';

        await channelRef.current.track({
          user_id: user.id,
          user_name: userName,
          user_avatar: profile?.avatar_url || null,
          card_id: cardId,
          cursor_position: cursorPosition,
          last_seen: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error updating user position:', error);
      }
    }
  };

  return {
    activeUsers,
    updateUserPosition,
  };
};
