
import React from 'react';
import { Eye, UserCog, RotateCcw, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface UserTableRowProps {
  user: OrganizationUser;
  currentUserId: string | undefined;
  organizationCreatedBy: string | undefined;
  userRole: string | undefined;
  onRoleUpdate: (userId: string, newRole: string) => void;
  onStatusUpdate: (userId: string, newStatus: string) => void;
  onViewDetails: (user: OrganizationUser) => void;
  onManageRestrictions: (user: OrganizationUser) => void;
  onPasswordReset: (user: OrganizationUser) => void;
  onDeleteUser: (user: OrganizationUser) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  currentUserId,
  organizationCreatedBy,
  userRole,
  onRoleUpdate,
  onStatusUpdate,
  onViewDetails,
  onManageRestrictions,
  onPasswordReset,
  onDeleteUser,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'org_admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'learner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canDeleteUser = () => {
    if (user.id === currentUserId) return false;
    if (user.id === organizationCreatedBy) return false;
    return true;
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">
          {user.first_name || user.last_name 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : 'No name'
          }
        </div>
        {user.restrictions && (
          <div className="flex gap-1 mt-1">
            {user.restrictions.view_only_mode && (
              <Badge variant="outline" className="text-xs">View Only</Badge>
            )}
            {user.restrictions.block_deck_creation && (
              <Badge variant="outline" className="text-xs">No Create</Badge>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {user.email}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Select
            value={user.role}
            onValueChange={(newRole) => onRoleUpdate(user.id, newRole)}
            disabled={user.id === organizationCreatedBy}
          >
            <SelectTrigger className="w-auto h-8">
              <Badge className={getRoleColor(user.role)}>
                {user.role.replace('_', ' ')}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              {(userRole === 'super_admin' || userRole === 'org_admin' || user.role === 'org_admin') && (
                <SelectItem value="org_admin">Org Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
          {user.id === organizationCreatedBy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The organization creator's role cannot be changed.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={user.status}
          onValueChange={(newStatus) => onStatusUpdate(user.id, newStatus)}
        >
          <SelectTrigger className="w-auto h-8">
            <Badge className={getStatusColor(user.status)}>
              {user.status.replace('_', ' ')}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-sm">
        {formatDate(user.last_login)}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(user)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageRestrictions(user)}
          >
            <UserCog className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPasswordReset(user)}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          {canDeleteUser() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteUser(user)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
