
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
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'super_admin' | 'org_admin' | 'manager' | 'learner';
  status: 'active' | 'invited' | 'pending';
  joined_at: string | null;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  userRole: string | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  fetchUserOrganizations: () => Promise<void>;
  createOrganization: (name: string) => Promise<Organization | null>;
  switchOrganization: (orgId: string) => Promise<void>;
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

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) return null;

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          created_by: user.id,
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

  useEffect(() => {
    fetchUserOrganizations();
  }, [user]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        userOrganizations,
        userRole,
        isLoading,
        setCurrentOrganization,
        fetchUserOrganizations,
        createOrganization,
        switchOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
