
import React, { useState } from 'react';
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
import { ChevronDown, Building, Plus, User } from 'lucide-react';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';

export const OrganizationSelector: React.FC = () => {
  const { currentOrganization, userOrganizations, switchOrganization, userRole } = useOrganization();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // If user has no organizations, show individual mode indicator
  if (userOrganizations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Individual Mode</span>
        </Button>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create Org</span>
        </Button>
        <CreateOrganizationDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateOrganizationDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};
