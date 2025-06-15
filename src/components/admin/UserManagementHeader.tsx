
import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserManagementHeaderProps {
  organizationName: string;
  showAddUserForm: boolean;
  onToggleAddUser: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  organizationName,
  showAddUserForm,
  onToggleAddUser,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users and roles for {organizationName}
            </CardDescription>
          </div>
        </div>
        <Button 
          onClick={onToggleAddUser} 
          className="flex items-center gap-2"
          variant={showAddUserForm ? "outline" : "default"}
        >
          <UserPlus className="w-4 h-4" />
          {showAddUserForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>
    </CardHeader>
  );
};
