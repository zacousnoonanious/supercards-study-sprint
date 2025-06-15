
import { supabase } from '@/integrations/supabase/client';
import { Organization, PendingApproval } from './types';

export const createOrganizationAPI = async (
  name: string, 
  approvedDomains: string[], 
  userId: string
): Promise<Organization | null> => {
  try {
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name, created_by: userId, approved_domains: approvedDomains }])
      .select('*')
      .single();

    if (orgError) throw orgError;

    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([{
        organization_id: orgData.id,
        user_id: userId,
        role: 'super_admin',
        status: 'active',
        joined_at: new Date().toISOString()
      }]);

    if (memberError) throw memberError;

    return orgData;
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return null;
  }
};

export const updateOrganizationAPI = async (id: string, name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return false;
  }
};

export const updateApprovedDomainsAPI = async (id: string, approvedDomains: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ approved_domains: approvedDomains })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating approved domains:', error);
    return false;
  }
};

export const joinOrganizationAPI = async (
  orgId: string, 
  userEmail: string, 
  userId: string
): Promise<{ success: boolean; message: string; status?: string }> => {
  try {
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, approved_domains')
      .eq('id', orgId)
      .single();

    if (orgError || !orgData) {
      return { 
        success: false, 
        message: 'Organization not found. Please check the organization ID.' 
      };
    }

    const userDomain = userEmail.split('@')[1];
    const approvedDomains = orgData.approved_domains || [];
    
    const isDomainApproved = approvedDomains.includes(userDomain);
    const isPublicDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'].includes(userDomain);
    
    let status = 'pending_approval';
    let pendingReason = 'Email domain not in approved list';
    
    if (isDomainApproved) {
      if (isPublicDomain) {
        status = 'pending_approval';
        pendingReason = 'Public email domain requires manual approval for security';
      } else {
        status = 'active';
        pendingReason = null;
      }
    }

    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: userId,
        role: 'learner',
        status: status,
        pending_reason: pendingReason,
        joined_at: status === 'active' ? new Date().toISOString() : null
      });

    if (memberError) {
      if (memberError.code === '23505') {
        return { 
          success: false, 
          message: 'You are already a member of this organization or have a pending request.' 
        };
      }
      throw memberError;
    }

    if (status === 'active') {
      return { 
        success: true, 
        message: `Successfully joined ${orgData.name}!`,
        status: status
      };
    } else {
      return { 
        success: true, 
        message: `Request to join ${orgData.name} submitted. ${isPublicDomain ? 'Public domain requests require admin approval for security.' : 'Waiting for admin approval.'}`,
        status: status
      };
    }
  } catch (error: any) {
    console.error('Error joining organization:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to join organization. Please try again.' 
    };
  }
};

export const fetchPendingApprovalsAPI = async (orgId: string): Promise<PendingApproval[]> => {
  try {
    const { data: pendingMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('id, user_id, role, pending_reason, created_at')
      .eq('organization_id', orgId)
      .eq('status', 'pending_approval');

    if (membersError) throw membersError;

    if (!pendingMembers || pendingMembers.length === 0) {
      return [];
    }

    const userIds = pendingMembers.map(member => member.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    const approvals = pendingMembers.map(member => {
      const profile = profiles?.find(p => p.id === member.user_id);
      return {
        id: member.id,
        email: profile?.email || '',
        role: member.role,
        pending_reason: member.pending_reason || '',
        created_at: member.created_at,
        first_name: profile?.first_name,
        last_name: profile?.last_name
      };
    });

    return approvals;
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return [];
  }
};

export const approveMemberAPI = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organization_members')
      .update({ 
        status: 'active',
        joined_at: new Date().toISOString(),
        pending_reason: null
      })
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error approving member:', error);
    return false;
  }
};

export const rejectMemberAPI = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error rejecting member:', error);
    return false;
  }
};
