
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OrganizationInvite {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  invite_token: string;
  status: string;
  expires_at: string;
  created_at: string;
  organization_id: string;
}

export const useOrganizationInvites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const acceptInvite = async (inviteToken: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to accept an invite.' };
    }

    setIsLoading(true);
    try {
      // Call the database function to accept the invite
      const { data, error } = await supabase
        .rpc('accept_organization_invite', {
          invite_token: inviteToken,
          user_id: user.id
        });

      if (error) throw error;

      if (data) {
        return { success: true, message: 'Successfully joined the organization!' };
      } else {
        return { success: false, message: 'Invalid or expired invitation.' };
      }
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      return { success: false, message: error.message || 'Failed to accept invitation.' };
    } finally {
      setIsLoading(false);
    }
  };

  const getInviteDetails = async (inviteToken: string): Promise<{ invite: OrganizationInvite | null; organization: any | null }> => {
    try {
      const { data: inviteData, error: inviteError } = await supabase
        .from('organization_invites')
        .select(`
          *,
          organizations!inner(id, name)
        `)
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (inviteError || !inviteData) {
        return { invite: null, organization: null };
      }

      return { 
        invite: inviteData, 
        organization: inviteData.organizations 
      };
    } catch (error) {
      console.error('Error fetching invite details:', error);
      return { invite: null, organization: null };
    }
  };

  return {
    acceptInvite,
    getInviteDetails,
    isLoading,
  };
};
