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

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  userRole: string | null;
  isLoading: boolean;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (name: string, approvedDomains: string[]) => Promise<Organization | null>;
  updateOrganization: (id: string, name: string) => Promise<boolean>;
  updateApprovedDomains: (id: string, approvedDomains: string[]) => Promise<boolean>;
  joinOrganization: (orgId: string, userEmail: string) => Promise<{ success: boolean; message: string }>;
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
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (name: string, approvedDomains: string[]): Promise<Organization | null> => {
    try {
      if (!user?.id) return null;

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name, created_by: user.id, approved_domains }])
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

  const joinOrganization = async (orgId: string, userEmail: string): Promise<{ success: boolean; message: string }> => {
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
          message: `Successfully joined ${orgData.name}!` 
        };
      } else {
        return { 
          success: true, 
          message: `Request to join ${orgData.name} submitted. ${isPublicDomain ? 'Public domain requests require admin approval for security.' : 'Waiting for admin approval.'}` 
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

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    userRole,
    isLoading,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    updateApprovedDomains,
    joinOrganization,
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
