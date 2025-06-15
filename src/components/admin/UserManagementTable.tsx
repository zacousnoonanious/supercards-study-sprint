
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserTableRow } from './UserTableRow';

interface OrganizationUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  last_login: string | null;
  joined_at: string | null;
  restrictions?: {
    view_only_mode: boolean;
    block_deck_creation: boolean;
    disable_chat: boolean;
    disable_comments: boolean;
    can_change_own_password: boolean;
  };
}

interface UserManagementTableProps {
  users: OrganizationUser[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentUserId: string | undefined;
  organizationCreatedBy: string | undefined;
  userRole: string | undefined;
  onSort: (field: string) => void;
  onRoleUpdate: (userId: string, newRole: string) => void;
  onStatusUpdate: (userId: string, newStatus: string) => void;
  onViewDetails: (user: OrganizationUser) => void;
  onManageRestrictions: (user: OrganizationUser) => void;
  onPasswordReset: (user: OrganizationUser) => void;
  onDeleteUser: (user: OrganizationUser) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  loading,
  sortBy,
  sortOrder,
  currentUserId,
  organizationCreatedBy,
  userRole,
  onSort,
  onRoleUpdate,
  onStatusUpdate,
  onViewDetails,
  onManageRestrictions,
  onPasswordReset,
  onDeleteUser,
}) => {
  const handleSort = (field: string) => {
    onSort(field);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('email')}
            >
              Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('role')}
            >
              Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('last_login')}
            >
              Last Login {sortBy === 'last_login' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                organizationCreatedBy={organizationCreatedBy}
                userRole={userRole}
                onRoleUpdate={onRoleUpdate}
                onStatusUpdate={onStatusUpdate}
                onViewDetails={onViewDetails}
                onManageRestrictions={onManageRestrictions}
                onPasswordReset={onPasswordReset}
                onDeleteUser={onDeleteUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
