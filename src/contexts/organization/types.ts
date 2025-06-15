
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  approved_domains: string[];
  deleted_at?: string | null;
}

export interface PendingApproval {
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

export interface OrganizationContextType {
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
  deleteOrganization: (id: string) => Promise<boolean>;
  joinOrganization: (orgId: string, userEmail: string) => Promise<{ success: boolean; message: string; status?: string }>;
  switchOrganization: (orgId: string) => void;
  approveMember: (memberId: string) => Promise<boolean>;
  rejectMember: (memberId: string) => Promise<boolean>;
}
