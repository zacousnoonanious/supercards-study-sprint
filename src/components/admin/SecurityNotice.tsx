
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Settings } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DomainManagementDialog } from '@/components/DomainManagementDialog';
import { isPublicDomain } from '@/utils/domainValidation';

export const SecurityNotice: React.FC = () => {
  const { currentOrganization } = useOrganization();
  
  if (!currentOrganization?.approved_domains) return null;
  
  const approvedDomains = currentOrganization.approved_domains;
  const publicDomains = approvedDomains.filter(isPublicDomain);
  const hasPublicDomains = publicDomains.length > 0;
  
  if (!hasPublicDomains) return null;

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Security Notice:</strong> You have {publicDomains.length} public email domain(s) approved ({publicDomains.join(', ')}). 
          Users from these domains can auto-join your organization. Consider reviewing your domain settings.
        </div>
        <DomainManagementDialog 
          trigger={
            <Button variant="outline" size="sm" className="ml-4">
              <Settings className="w-4 h-4 mr-2" />
              Review Domains
            </Button>
          } 
        />
      </AlertDescription>
    </Alert>
  );
};
