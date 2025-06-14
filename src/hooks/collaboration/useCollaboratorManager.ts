
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CollaboratorInfo } from './types';

interface UseCollaboratorManagerProps {
  setId: string;
}

export const useCollaboratorManager = ({ setId }: UseCollaboratorManagerProps) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isCollaborative, setIsCollaborative] = useState(false);

  const fetchCollaborators = async () => {
    if (!setId) return;
    
    try {
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

  const checkCollaborativeStatus = async () => {
    if (!setId) return;
    
    try {
      const { data: setData } = await supabase
        .from('flashcard_sets')
        .select('is_collaborative')
        .eq('id', setId)
        .single();

      if (setData?.is_collaborative) {
        setIsCollaborative(true);
      }
    } catch (error) {
      console.error('Error checking collaborative status:', error);
    }
  };

  const inviteCollaborator = async (email: string, role: 'editor' | 'viewer' = 'editor'): Promise<boolean> => {
    if (!user || !setId) return false;
    
    try {
      // For now, we'll need to use a different approach since we can't directly query auth.users
      // This is a simplified implementation that assumes the user provides a valid user ID
      // In a real implementation, you'd need a server-side function to lookup users by email
      console.log('Attempting to invite user with email:', email);
      
      // Since we can't query auth.users directly, we'll return false for now
      // This would need to be implemented with a server-side function or edge function
      console.log('User invitation requires server-side implementation to lookup users by email');
      return false;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      return false;
    }
  };

  const enableCollaboration = async () => {
    if (!setId) return false;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ is_collaborative: true })
        .eq('id', setId);

      if (error) {
        console.error('Update error:', error);
        return false;
      }
      
      setIsCollaborative(true);
      return true;
    } catch (error) {
      console.error('Error enabling collaboration:', error);
      return false;
    }
  };

  // Initial load
  useEffect(() => {
    if (setId) {
      checkCollaborativeStatus();
      fetchCollaborators();
    }
  }, [setId]);

  return {
    collaborators,
    isCollaborative,
    inviteCollaborator,
    enableCollaboration,
    fetchCollaborators,
  };
};
