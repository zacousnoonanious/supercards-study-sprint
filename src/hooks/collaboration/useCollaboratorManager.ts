
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
      // Simplified approach - query profiles table directly without complex type inference
      const profileResult = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);

      // Check if query was successful and has data
      if (profileResult.error) {
        console.error('Profile query error:', profileResult.error);
        return false;
      }

      const profiles = profileResult.data;
      if (!profiles || profiles.length === 0) {
        return false;
      }

      const userId = profiles[0].id;
      
      const { error: insertError } = await supabase
        .from('deck_collaborators')
        .insert({
          set_id: setId,
          user_id: userId,
          role,
          invited_by: user.id,
          accepted_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return false;
      }
      
      await fetchCollaborators();
      return true;
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
