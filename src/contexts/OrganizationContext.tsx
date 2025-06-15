
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface Organization {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  approved_domains: string[];
}

interface PendingApproval {
  id: string;
  email: string;
  role: string;
  pending_reason: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  first_name?: string;
  last_name?: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  userOrganizations: Organization[];
  userRole: string | null;
  isLoading: boolean;
  pendingApprovals: PendingApproval[];
  fetchOrganizations: () => Promise<void>;
  createOrganization: (name: string, approvedDomains: string[]) => Promise<Organization | null>;
  updateOrganization: (id: string, name: string) => Promise<boolean>;
  updateApprovedDomains: (id: string, approvedDomains: string[]) => Promise<boolean>;
  joinOrganization: (orgId: string, userEmail: string) => Promise<{ success: boolean; message: string; status?: string }>;
  switchOrganization: (orgId: string) => void;
  approveMember: (memberId: string) => Promise<boolean>;
  rejectMember: (memberId: string) => Promise<boolean>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setUserRole(null);
      setPendingApprovals([]);
    }
  }, [session]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        return;
      }

      const { data: orgMemberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      const organizationIds = orgMemberships?.map(membership => membership.organization_id) || [];

      if (organizationIds.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        return;
      }

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', organizationIds);

      if (orgError) throw orgError;

      if (!orgData || orgData.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        return;
      }

      setOrganizations(orgData);

      // Set current organization to the first one and user role
      const firstOrg = orgData[0];
      setCurrentOrganization(firstOrg);
      setUserRole(orgMemberships.find(m => m.organization_id === firstOrg.id)?.role || null);

      // Fetch pending approvals if user is admin
      const currentUserRole = orgMemberships.find(m => m.organization_id === firstOrg.id)?.role;
      if (currentUserRole === 'org_admin' || currentUserRole === 'super_admin') {
        await fetchPendingApprovals(firstOrg.id);
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingApprovals = async (orgId: string) => {
    try {
      // First get pending organization members
      const { data: pendingMembers, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role, pending_reason, created_at')
        .eq('organization_id', orgId)
        .eq('status', 'pending_approval');

      if (membersError) throw membersError;

      if (!pendingMembers || pendingMembers.length === 0) {
        setPendingApprovals([]);
        return;
      }

      // Get user IDs from pending members
      const userIds = pendingMembers.map(member => member.user_id);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
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

      setPendingApprovals(approvals);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const createOrganization = async (name: string, approvedDomains: string[]): Promise<Organization | null> => {
    try {
      if (!user?.id) return null;

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name, created_by: user.id, approved_domains: approvedDomains }])
        .select('*')
        .single();

      if (orgError) throw orgError;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'super_admin',
          status: 'active',
          joined_at: new Date().toISOString()
        }]);

      if (memberError) throw memberError;

      await fetchOrganizations();
      return orgData;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      return null;
    }
  };

  const updateOrganization = async (id: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      await fetchOrganizations();
      return true;
    } catch (error: any) {
      console.error('Error updating organization:', error);
      return false;
    }
  };

  const updateApprovedDomains = async (id: string, approvedDomains: string[]): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ approved_domains: approvedDomains })
        .eq('id', id);

      if (error) throw error;

      await fetchOrganizations();
      return true;
    } catch (error: any) {
      console.error('Error updating approved domains:', error);
      return false;
    }
  };

  const joinOrganization = async (orgId: string, userEmail: string): Promise<{ success: boolean; message: string; status?: string }> => {
    try {
      // Get organization details to check approved domains
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

      // Extract domain from email
      const userDomain = userEmail.split('@')[1];
      const approvedDomains = orgData.approved_domains || [];
      
      // Check if domain is approved and if it's a public domain
      const isDomainApproved = approvedDomains.includes(userDomain);
      const isPublicDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'].includes(userDomain);
      
      // Determine status based on domain approval and type
      let status = 'pending_approval';
      let pendingReason = 'Email domain not in approved list';
      
      if (isDomainApproved) {
        if (isPublicDomain) {
          // Even if public domain is approved, still require manual approval for security
          status = 'pending_approval';
          pendingReason = 'Public email domain requires manual approval for security';
        } else {
          // Corporate domain that's approved - auto-approve
          status = 'active';
          pendingReason = null;
        }
      }

      // Add user to organization with determined status
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: user?.id,
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
        await fetchOrganizations();
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

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      // Update user role for this organization
      // This would need to be fetched from organization_members table
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

      // Refresh pending approvals
      if (currentOrganization) {
        await fetchPendingApprovals(currentOrganization.id);
      }
      
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

      // Refresh pending approvals
      if (currentOrganization) {
        await fetchPendingApprovals(currentOrganization.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error rejecting member:', error);
      return false;
    }
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    userOrganizations: organizations, // Alias for compatibility
    userRole,
    isLoading,
    pendingApprovals,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    updateApprovedDomains,
    joinOrganization,
    switchOrganization,
    approveMember,
    rejectMember,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
