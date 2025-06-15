import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCog, Shield, Eye, Edit, RotateCcw, UserX, Filter } from 'lucide-react';
import { UserDetailsDialog } from './UserDetailsDialog';
import { UserRestrictionsDialog } from './UserRestrictionsDialog';
import { PasswordResetDialog } from './PasswordResetDialog';

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

export const UserManagement: React.FC = () => {
  const { currentOrganization, userRole } = useOrganization();
  const { toast } = useToast();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Only allow org_admin and super_admin access
  if (!userRole || !['org_admin', 'super_admin'].includes(userRole)) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            This area is only accessible to organization administrators.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const fetchUsers = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      
      // First, get organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id, role, status, joined_at')
        .eq('organization_id', currentOrganization.id);

      if (membersError) throw membersError;

      if (!membersData || membersData.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = membersData.map(member => member.user_id);
      
      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, last_login')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      
      // Get user restrictions
      const { data: restrictionsData } = await supabase
        .from('user_restrictions')
        .select('*')
        .in('user_id', userIds)
        .eq('organization_id', currentOrganization.id);

      // For now, we'll use placeholder emails since we can't access auth.users directly
      // In a real implementation, you'd need to store emails in profiles or use a server function
      const transformedUsers: OrganizationUser[] = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        const restrictions = restrictionsData?.find(r => r.user_id === member.user_id);
        
        return {
          id: member.user_id,
          email: `user-${member.user_id.slice(0, 8)}@example.com`, // Placeholder - needs proper implementation
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          role: member.role,
          status: member.status,
          last_login: profile?.last_login || null,
          joined_at: member.joined_at,
          restrictions: restrictions ? {
            view_only_mode: restrictions.view_only_mode,
            block_deck_creation: restrictions.block_deck_creation,
            disable_chat: restrictions.disable_chat,
            disable_comments: restrictions.disable_comments,
            can_change_own_password: restrictions.can_change_own_password,
          } : undefined
        };
      });

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load organization users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentOrganization]);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    if (!currentOrganization) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ status: newStatus })
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = searchTerm === '' || 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
          const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
          compareValue = nameA.localeCompare(nameB);
          break;
        case 'email':
          compareValue = a.email.localeCompare(b.email);
          break;
        case 'role':
          compareValue = a.role.localeCompare(b.role);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'last_login':
          const dateA = a.last_login ? new Date(a.last_login).getTime() : 0;
          const dateB = b.last_login ? new Date(b.last_login).getTime() : 0;
          compareValue = dateA - dateB;
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

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

  if (!currentOrganization) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle>No Organization Selected</CardTitle>
          <CardDescription>
            Please select an organization to manage users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and roles for {currentOrganization.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'email') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('email');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'role') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('role');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'status') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('status');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'last_login') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('last_login');
                        setSortOrder('asc');
                      }
                    }}
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
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
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
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                        >
                          <SelectTrigger className="w-auto h-8">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="learner">Learner</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            {userRole === 'super_admin' && (
                              <SelectItem value="org_admin">Org Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.status}
                          onValueChange={(newStatus) => handleStatusUpdate(user.id, newStatus)}
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
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRestrictions(true);
                            }}
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPasswordReset(true);
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <UserDetailsDialog
            user={selectedUser}
            open={showUserDetails}
            onOpenChange={setShowUserDetails}
          />
          <UserRestrictionsDialog
            user={selectedUser}
            open={showRestrictions}
            onOpenChange={setShowRestrictions}
            onUpdate={fetchUsers}
          />
          <PasswordResetDialog
            user={selectedUser}
            open={showPasswordReset}
            onOpenChange={setShowPasswordReset}
          />
        </>
      )}
    </div>
  );
};
