
import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building, User, Settings, UserCheck, Trash2 } from 'lucide-react';
import { DomainManagementDialog } from './DomainManagementDialog';
import { PendingApprovalsDialog } from './PendingApprovalsDialog';
import { DeleteOrganizationDialog } from './DeleteOrganizationDialog';

export const OrganizationSelector: React.FC = () => {
  const { currentOrganization, userOrganizations, switchOrganization, userRole, pendingApprovals } = useOrganization();

  const isAdmin = userRole === 'org_admin' || userRole === 'super_admin';

  // If user has no organizations, show individual mode indicator
  if (userOrganizations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Individual Mode</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            <span className="max-w-32 truncate">
              {currentOrganization?.name || 'Select Organization'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>
            Your Organizations
            {userRole && (
              <span className="text-xs text-muted-foreground ml-2 capitalize">
                ({userRole.replace('_', ' ')})
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userOrganizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className={currentOrganization?.id === org.id ? 'bg-accent' : ''}
            >
              <Building className="w-4 h-4 mr-2" />
              {org.name}
            </DropdownMenuItem>
          ))}
          
          {isAdmin && currentOrganization && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <DomainManagementDialog
                  trigger={
                    <div className="flex items-center w-full cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Domains
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <PendingApprovalsDialog
                  trigger={
                    <div className="flex items-center w-full cursor-pointer relative">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Pending Approvals
                      {pendingApprovals.length > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {pendingApprovals.length}
                        </span>
                      )}
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeleteOrganizationDialog
                  trigger={
                    <div className="flex items-center w-full cursor-pointer text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Organization
                    </div>
                  }
                />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
