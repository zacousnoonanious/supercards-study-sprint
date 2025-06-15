
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Organization, PendingApproval } from './types';
import { fetchPendingApprovalsAPI } from './organizationAPI';

export const useOrganizationData = () => {
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

      const firstOrg = orgData[0];
      setCurrentOrganization(firstOrg);
      setUserRole(orgMemberships.find(m => m.organization_id === firstOrg.id)?.role || null);

      const currentUserRole = orgMemberships.find(m => m.organization_id === firstOrg.id)?.role;
      if (currentUserRole === 'org_admin' || currentUserRole === 'super_admin') {
        const approvals = await fetchPendingApprovalsAPI(firstOrg.id);
        setPendingApprovals(approvals);
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  return {
    currentOrganization,
    organizations,
    userRole,
    isLoading,
    user,
    pendingApprovals,
    setPendingApprovals,
    fetchOrganizations,
    switchOrganization
  };
};
