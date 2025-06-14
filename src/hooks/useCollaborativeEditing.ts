
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePresenceManager } from './collaboration/usePresenceManager';
import { useCollaboratorManager } from './collaboration/useCollaboratorManager';
import type { UseCollaborativeEditingProps } from './collaboration/types';

export type { CollaborativeUser, CollaboratorInfo } from './collaboration/types';

export const useCollaborativeEditing = ({ setId, cardId }: UseCollaborativeEditingProps) => {
  // Use the collaborator manager to handle collaborative features
  const {
    collaborators,
    isCollaborative,
    enableCollaboration,
    fetchCollaborators,
    removeCollaborator,
  } = useCollaboratorManager({ setId });

  // Use the presence manager to handle real-time user presence
  const {
    activeUsers,
    updateUserPosition,
  } = usePresenceManager({ setId, cardId, isCollaborative });

  // Set up realtime subscription for collaborator changes
  useEffect(() => {
    if (!isCollaborative) return;

    const channel = supabase
      .channel(`collaborators-${setId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deck_collaborators',
        filter: `set_id=eq.${setId}`,
      }, (payload) => {
        console.log('Collaborator change:', payload);
        fetchCollaborators();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setId, isCollaborative, fetchCollaborators]);

  return {
    activeUsers,
    collaborators,
    isCollaborative,
    updateUserPosition,
    enableCollaboration,
    fetchCollaborators,
    removeCollaborator,
  };
};
