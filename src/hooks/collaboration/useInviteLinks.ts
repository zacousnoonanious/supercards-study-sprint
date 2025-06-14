
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteLink {
  id: string;
  invite_token: string;
  role: 'editor' | 'viewer';
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  password_hash: string | null;
}

interface UseInviteLinksProps {
  setId: string;
}

export const useInviteLinks = ({ setId }: UseInviteLinksProps) => {
  const { user } = useAuth();
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchInviteLinks = async () => {
    if (!setId) return;
    
    try {
      const { data, error } = await supabase
        .from('deck_invite_links')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to ensure proper typing
      const typedData: InviteLink[] = (data || []).map(link => ({
        ...link,
        role: link.role as 'editor' | 'viewer'
      }));
      
      setInviteLinks(typedData);
    } catch (error) {
      console.error('Error fetching invite links:', error);
    }
  };

  const createInviteLink = async (
    role: 'editor' | 'viewer' = 'editor',
    expiresInHours?: number,
    maxUses?: number,
    password?: string
  ): Promise<string | null> => {
    if (!user || !setId) return null;
    
    setIsCreating(true);
    try {
      // Generate token using the database function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invite_token');

      if (tokenError) throw tokenError;

      const expiresAt = expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      // Hash password if provided
      let passwordHash = null;
      if (password) {
        const { data: hashData, error: hashError } = await supabase
          .rpc('hash_password', { password });
        
        if (hashError) throw hashError;
        passwordHash = hashData;
      }

      const { data, error } = await supabase
        .from('deck_invite_links')
        .insert({
          set_id: setId,
          created_by: user.id,
          invite_token: tokenData,
          role,
          expires_at: expiresAt,
          max_uses: maxUses,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchInviteLinks();
      return `${window.location.origin}/invite/${tokenData}`;
    } catch (error) {
      console.error('Error creating invite link:', error);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const deactivateInviteLink = async (linkId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('deck_invite_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;
      
      await fetchInviteLinks();
      return true;
    } catch (error) {
      console.error('Error deactivating invite link:', error);
      return false;
    }
  };

  const joinDeckViaInvite = async (inviteToken: string, password?: string): Promise<{ success: boolean; message: string; requiresPassword?: boolean }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to join a deck.' };
    }

    try {
      // Get the invite link details
      const { data: inviteData, error: inviteError } = await supabase
        .from('deck_invite_links')
        .select('*')
        .eq('invite_token', inviteToken)
        .eq('is_active', true)
        .single();

      if (inviteError || !inviteData) {
        return { success: false, message: 'Invalid or expired invite link.' };
      }

      // Check if invite has expired
      if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
        return { success: false, message: 'This invite link has expired.' };
      }

      // Check if max uses reached
      if (inviteData.max_uses && inviteData.current_uses >= inviteData.max_uses) {
        return { success: false, message: 'This invite link has reached its maximum number of uses.' };
      }

      // Check password if required
      if (inviteData.password_hash) {
        if (!password) {
          return { success: false, message: 'This invite requires a password.', requiresPassword: true };
        }

        const { data: passwordValid, error: passwordError } = await supabase
          .rpc('verify_invite_password', { invite_token: inviteToken, password });

        if (passwordError || !passwordValid) {
          return { success: false, message: 'Incorrect password.' };
        }
      }

      // Check if user is already a collaborator
      const { data: existingCollab } = await supabase
        .from('deck_collaborators')
        .select('id')
        .eq('set_id', inviteData.set_id)
        .eq('user_id', user.id)
        .single();

      if (existingCollab) {
        return { success: false, message: 'You are already a collaborator on this deck.' };
      }

      // Add user as collaborator
      const { error: collabError } = await supabase
        .from('deck_collaborators')
        .insert({
          set_id: inviteData.set_id,
          user_id: user.id,
          role: inviteData.role,
          invited_by: inviteData.created_by,
          accepted_at: new Date().toISOString(),
        });

      if (collabError) throw collabError;

      // Increment usage count
      const { error: updateError } = await supabase
        .from('deck_invite_links')
        .update({ current_uses: inviteData.current_uses + 1 })
        .eq('id', inviteData.id);

      if (updateError) console.error('Error updating usage count:', updateError);

      return { success: true, message: 'Successfully joined the deck!' };
    } catch (error) {
      console.error('Error joining deck via invite:', error);
      return { success: false, message: 'Failed to join deck. Please try again.' };
    }
  };

  return {
    inviteLinks,
    isCreating,
    fetchInviteLinks,
    createInviteLink,
    deactivateInviteLink,
    joinDeckViaInvite,
  };
};
