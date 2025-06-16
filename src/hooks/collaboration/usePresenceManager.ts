
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
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Early return if conditions aren't met
    if (!user || !setId || !isCollaborative) {
      // Clean up existing connections if conditions change
      if (channelRef.current) {
        console.log('Cleaning up channel due to missing conditions');
        channelRef.current.unsubscribe();
        channelRef.current = null;
        isSubscribedRef.current = false;
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
        // If we already have a subscribed channel, don't create another one
        if (channelRef.current && isSubscribedRef.current) {
          console.log('Channel already exists and subscribed, updating track only');
          
          // Just update the tracking for the existing channel
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
            card_id: cardId || null,
            last_seen: new Date().toISOString(),
          });
          return;
        }

        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' : 'Anonymous User';

        // Clean up existing channel before creating new one
        if (channelRef.current) {
          console.log('Cleaning up existing channel before creating new one');
          await channelRef.current.unsubscribe();
          isSubscribedRef.current = false;
        }

        // Set up realtime channel with unique channel name
        const channelName = `set-${setId}-${Date.now()}`;
        console.log('Creating new channel:', channelName);
        
        const channel = supabase.channel(channelName, {
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

        console.log('Subscribing to channel...');
        await channel.subscribe(async (status) => {
          console.log('Channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            // Track current user presence
            await channel.track({
              user_id: user.id,
              user_name: userName,
              user_avatar: profile?.avatar_url || null,
              card_id: cardId || null,
              last_seen: new Date().toISOString(),
            });
            console.log('Successfully subscribed and tracked presence');
          }
        });

        channelRef.current = channel;

        // Clean up existing heartbeat before setting new one
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Set up heartbeat to keep session alive
        const heartbeat = setInterval(async () => {
          if (channelRef.current && isSubscribedRef.current) {
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
        isSubscribedRef.current = false;
      }
    };

    initializePresence();

    return () => {
      console.log('Cleaning up presence manager');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [user?.id, setId, isCollaborative]); // Removed cardId from dependencies to prevent re-subscription

  const updateUserPosition = async (cardId: string | null, cursorPosition?: any) => {
    if (channelRef.current && user && isSubscribedRef.current) {
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
