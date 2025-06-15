
import React, { createContext, useContext } from 'react';
import { OrganizationContextType } from './organization/types';
import { useOrganizationData } from './organization/useOrganizationData';
import {
  createOrganizationAPI,
  updateOrganizationAPI,
  updateApprovedDomainsAPI,
  joinOrganizationAPI,
  fetchPendingApprovalsAPI,
  approveMemberAPI,
  rejectMemberAPI
} from './organization/organizationAPI';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const {
    currentOrganization,
    organizations,
    userRole,
    isLoading,
    user,
    pendingApprovals,
    setPendingApprovals,
    fetchOrganizations,
    switchOrganization
  } = useOrganizationData();

  const createOrganization = async (name: string, approvedDomains: string[]) => {
    if (!user?.id) return null;
    const result = await createOrganizationAPI(name, approvedDomains, user.id);
    if (result) {
      await fetchOrganizations();
    }
    return result;
  };

  const updateOrganization = async (id: string, name: string): Promise<boolean> => {
    const success = await updateOrganizationAPI(id, name);
    if (success) {
      await fetchOrganizations();
    }
    return success;
  };

  const updateApprovedDomains = async (id: string, approvedDomains: string[]): Promise<boolean> => {
    const success = await updateApprovedDomainsAPI(id, approvedDomains);
    if (success) {
      await fetchOrganizations();
    }
    return success;
  };

  const joinOrganization = async (orgId: string, userEmail: string) => {
    if (!user?.id) {
      return { success: false, message: 'User not authenticated' };
    }
    const result = await joinOrganizationAPI(orgId, userEmail, user.id);
    if (result.success && result.status === 'active') {
      await fetchOrganizations();
    }
    return result;
  };

  const approveMember = async (memberId: string): Promise<boolean> => {
    const success = await approveMemberAPI(memberId);
    if (success && currentOrganization) {
      const approvals = await fetchPendingApprovalsAPI(currentOrganization.id);
      setPendingApprovals(approvals);
    }
    return success;
  };

  const rejectMember = async (memberId: string): Promise<boolean> => {
    const success = await rejectMemberAPI(memberId);
    if (success && currentOrganization) {
      const approvals = await fetchPendingApprovalsAPI(currentOrganization.id);
      setPendingApprovals(approvals);
    }
    return success;
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    userOrganizations: organizations,
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
