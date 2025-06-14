import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaborativeUser {
  id: string;
  name: string;
  avatar: string | null;
  cursor_position?: any;
  card_id?: string | null;
  last_seen: string;
}

export interface CollaboratorInfo {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  user_name?: string;
  user_avatar?: string;
}

interface UseCollaborativeEditingProps {
  setId: string;
  cardId?: string;
}

interface PresenceState {
  [key: string]: Array<{
    user_id: string;
    user_name: string;
    user_avatar?: string;
    card_id?: string;
    cursor_position?: any;
    last_seen: string;
  }>;
}

// Define explicit types for database responses
interface CollaboratorQueryResult {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useCollaborativeEditing = ({ setId, cardId }: UseCollaborativeEditingProps) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize collaborative session
  useEffect(() => {
    if (!user || !setId) return;

    const initializeCollaboration = async () => {
      try {
        // Check if deck is collaborative and get collaborators
        const { data: setData } = await supabase
          .from('flashcard_sets')
          .select('is_collaborative, collaboration_settings')
          .eq('id', setId)
          .single();

        if (setData?.is_collaborative) {
          setIsCollaborative(true);
          
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', user.id)
            .single();

          const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User' : 'Anonymous User';

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
              // Handle real-time card updates
            })
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'deck_collaborators',
              filter: `set_id=eq.${setId}`,
            }, (payload) => {
              console.log('Collaborator change:', payload);
              fetchCollaborators();
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
        }

        await fetchCollaborators();
      } catch (error) {
        console.error('Error initializing collaboration:', error);
      }
    };

    initializeCollaboration();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user, setId, cardId]);

  const fetchCollaborators = async () => {
    try {
      // Use a different query approach to avoid the join issue
      const { data: collaboratorsData } = await supabase
        .from('deck_collaborators')
        .select('id, user_id, role')
        .eq('set_id', setId)
        .not('accepted_at', 'is', null);

      if (collaboratorsData) {
        const formattedCollaborators: CollaboratorInfo[] = [];
        
        // Fetch profile data separately for each collaborator
        for (const collab of collaboratorsData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', collab.user_id)
            .single();

          const firstName = profile?.first_name || '';
          const lastName = profile?.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous User';
          
          formattedCollaborators.push({
            id: collab.id,
            user_id: collab.user_id,
            role: collab.role as 'owner' | 'editor' | 'viewer',
            user_name: fullName,
            user_avatar: profile?.avatar_url || undefined,
          });
        }
        
        setCollaborators(formattedCollaborators);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const updateUserPosition = async (cardId: string | null, cursorPosition?: any) => {
    if (channelRef.current && user) {
      try {
        // Simplify the profile fetch to avoid type recursion
        const profileQuery = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        const profile = profileQuery.data;
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

  const inviteCollaborator = async (email: string, role: 'editor' | 'viewer' = 'editor') => {
    try {
      // Simplify query to avoid type recursion
      const profileQuery = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      const invitedUser = profileQuery.data;

      if (invitedUser) {
        const insertResult = await supabase
          .from('deck_collaborators')
          .insert({
            set_id: setId,
            user_id: invitedUser.id,
            role,
            invited_by: user?.id,
            accepted_at: new Date().toISOString(), // Auto-accept for now
          });

        if (insertResult.error) throw insertResult.error;
        await fetchCollaborators();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      return false;
    }
  };

  const enableCollaboration = async () => {
    try {
      const updateResult = await supabase
        .from('flashcard_sets')
        .update({ is_collaborative: true })
        .eq('id', setId);

      if (updateResult.error) throw updateResult.error;
      setIsCollaborative(true);
      return true;
    } catch (error) {
      console.error('Error enabling collaboration:', error);
      return false;
    }
  };

  return {
    activeUsers,
    collaborators,
    isCollaborative,
    updateUserPosition,
    inviteCollaborator,
    enableCollaboration,
    fetchCollaborators,
  };
};
