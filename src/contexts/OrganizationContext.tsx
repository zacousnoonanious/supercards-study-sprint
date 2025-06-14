import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_domains?: string[];
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'learner';
  status: 'active' | 'invited' | 'pending' | 'pending_approval';
  joined_at: string | null;
  pending_reason?: string;
}

interface PendingApproval {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  pending_reason: string;
  created_at: string;
  organization_name: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  userRole: string | null;
  isLoading: boolean;
  pendingApprovals: PendingApproval[];
  setCurrentOrganization: (org: Organization | null) => void;
  fetchUserOrganizations: () => Promise<void>;
  createOrganization: (name: string, approvedDomains?: string[]) => Promise<Organization | null>;
  switchOrganization: (orgId: string) => Promise<void>;
  joinOrganization: (orgId: string, userEmail: string) => Promise<{ success: boolean; message: string; status?: string }>;
  fetchPendingApprovals: () => Promise<void>;
  approveMember: (memberId: string) => Promise<boolean>;
  rejectMember: (memberId: string) => Promise<boolean>;
  updateApprovedDomains: (orgId: string, domains: string[]) => Promise<boolean>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  const fetchUserOrganizations = async () => {
    if (!user) {
      setUserOrganizations([]);
      setCurrentOrganization(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user's organization memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select(`
          *,
          organizations:organization_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipError) throw membershipError;

      const orgs = memberships?.map(m => m.organizations).filter(Boolean) || [];
      setUserOrganizations(orgs);

      // Set current organization (first one or from localStorage)
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      let targetOrg = null;

      if (savedOrgId) {
        targetOrg = orgs.find(org => org.id === savedOrgId);
      }
      
      if (!targetOrg && orgs.length > 0) {
        targetOrg = orgs[0];
      }

      if (targetOrg) {
        setCurrentOrganization(targetOrg);
        localStorage.setItem('currentOrganizationId', targetOrg.id);
        
        // Set user role for current organization
        const membership = memberships?.find(m => m.organization_id === targetOrg.id);
        setUserRole(membership?.role || null);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (name: string, approvedDomains: string[] = []): Promise<Organization | null> => {
    if (!user) return null;

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          created_by: user.id,
          approved_domains: approvedDomains,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as org admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'org_admin',
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Refresh organizations
      await fetchUserOrganizations();
      
      return org;
    } catch (error) {
      console.error('Error creating organization:', error);
      return null;
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
      
      // Update user role
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();
      
      setUserRole(membership?.role || null);
    }
  };

  const joinOrganization = async (orgId: string, userEmail: string) => {
    if (!user) return { success: false, message: 'User not authenticated' };

    try {
      // Use the database function to process the join
      const { data, error } = await supabase.rpc('process_organization_join', {
        org_id: orgId,
        user_id: user.id,
        user_email: userEmail,
        invite_role: 'learner'
      });

      if (error) throw error;

      const status = data as string;
      
      if (status === 'active') {
        await fetchUserOrganizations();
        return { 
          success: true, 
          message: 'Successfully joined organization!', 
          status 
        };
      } else if (status === 'pending_approval') {
        return { 
          success: true, 
          message: 'Your request to join has been submitted for admin approval.', 
          status 
        };
      }

      return { success: false, message: 'Unknown status returned' };
    } catch (error) {
      console.error('Error joining organization:', error);
      return { success: false, message: 'Failed to join organization. Please try again.' };
    }
  };

  const fetchPendingApprovals = async () => {
    if (!user || !currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          pending_reason,
          created_at,
          profiles!user_id (first_name, last_name)
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending_approval');

      if (error) throw error;

      // Get user emails from auth.users (we need a separate approach for this)
      const userIds = data?.map(d => d.user_id) || [];
      
      if (userIds.length > 0) {
        // Since we can't directly query auth.users from the client,
        // we'll create the pending data without emails for now
        // In a production app, you'd want to store emails in profiles or use a server function
        const pendingData = data?.map(approval => ({
          ...approval,
          organization_name: currentOrganization.name,
          first_name: approval.profiles?.first_name || '',
          last_name: approval.profiles?.last_name || '',
          email: 'Email not available' // Placeholder - in production, store email in profiles
        })) || [];

        setPendingApprovals(pendingData);
      } else {
        setPendingApprovals([]);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
    }
  };

  const approveMember = async (memberId: string): Promise<boolean> => {
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
      
      await fetchPendingApprovals();
      return true;
    } catch (error) {
      console.error('Error approving member:', error);
      return false;
    }
  };

  const rejectMember = async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchPendingApprovals();
      return true;
    } catch (error) {
      console.error('Error rejecting member:', error);
      return false;
    }
  };

  const updateApprovedDomains = async (orgId: string, domains: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ approved_domains: domains })
        .eq('id', orgId);

      if (error) throw error;
      
      await fetchUserOrganizations();
      return true;
    } catch (error) {
      console.error('Error updating approved domains:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserOrganizations();
  }, [user]);

  useEffect(() => {
    if (currentOrganization && (userRole === 'org_admin' || userRole === 'super_admin')) {
      fetchPendingApprovals();
    }
  }, [currentOrganization, userRole]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        userOrganizations,
        userRole,
        isLoading,
        pendingApprovals,
        setCurrentOrganization,
        fetchUserOrganizations,
        createOrganization,
        switchOrganization,
        joinOrganization,
        fetchPendingApprovals,
        approveMember,
        rejectMember,
        updateApprovedDomains,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
