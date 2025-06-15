import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { UserDetailsDialog } from './UserDetailsDialog';
import { UserRestrictionsDialog } from './UserRestrictionsDialog';
import { PasswordResetDialog } from './PasswordResetDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { UserManagementHeader } from './UserManagementHeader';
import { AddUserInlineForm } from './AddUserInlineForm';
import { UserFilters } from './UserFilters';
import { UserManagementTable } from './UserManagementTable';

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
  const { user } = useAuth();
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
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null);
  
  // Add user inline form state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [addUserForm, setAddUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'learner',
  });

  // Only allow org_admin and super_admin access
  if (!userRole || !['org_admin', 'super_admin'].includes(userRole)) {
    return (
      <Card>
        <div className="text-center p-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            This area is only accessible to organization administrators.
          </p>
        </div>
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
        setLoading(false);
        return;
      }

      const userIds = membersData.map(member => member.user_id);
      
      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, last_login, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      
      // Get user restrictions
      const { data: restrictionsData } = await supabase
        .from('user_restrictions')
        .select('*')
        .in('user_id', userIds)
        .eq('organization_id', currentOrganization.id);

      // We now get real emails from profiles
      const transformedUsers: OrganizationUser[] = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        const restrictions = restrictionsData?.find(r => r.user_id === member.user_id);
        
        return {
          id: member.user_id,
          email: profile?.email || 'Email not available',
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

    if (userId === currentOrganization?.created_by) {
      toast({
        title: "Action Forbidden",
        description: "The organization creator's role cannot be changed.",
        variant: "destructive",
      });
      return;
    }

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

  const handleDeleteUser = async () => {
    if (!userToDelete || !currentOrganization) return;

    try {
      // Remove user from organization
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', userToDelete.id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Success",
        description: "User removed from organization.",
      });
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from organization.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleAddUser = async () => {
    if (!currentOrganization) return;

    setIsAddingUser(true);
    try {
      if (sendInvite) {
        // Create organization invite
        const { data, error } = await supabase
          .from('organization_invites')
          .insert({
            organization_id: currentOrganization.id,
            email: addUserForm.email,
            first_name: addUserForm.firstName,
            last_name: addUserForm.lastName,
            role: addUserForm.role,
            invite_token: generateInviteToken(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            invited_by: (await supabase.auth.getUser()).data.user?.id || '',
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          // Send invite email using edge function
          const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: addUserForm.email,
              firstName: addUserForm.firstName,
              lastName: addUserForm.lastName,
              organizationName: currentOrganization.name,
              inviteToken: data.invite_token,
            },
          });

          if (emailError) {
            console.error('Error sending invite email:', emailError);
            toast({
              title: "Invite Created",
              description: `Invitation created for ${addUserForm.email}, but email could not be sent. You can share the invite link manually.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Invite Sent",
              description: `An invitation has been sent to ${addUserForm.email}. They will have 7 days to accept.`,
            });
          }
        } else {
          toast({
            title: "Invite Created",
            description: `Invitation created for ${addUserForm.email}. You can share the invite link manually.`,
          });
        }
      } else {
        // Direct user creation without invite
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: addUserForm.email,
          password: generateTemporaryPassword(),
          user_metadata: {
            first_name: addUserForm.firstName,
            last_name: addUserForm.lastName,
          },
          email_confirm: true,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Add user to organization
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: currentOrganization.id,
              user_id: authData.user.id,
              role: addUserForm.role,
              status: 'active',
              joined_at: new Date().toISOString(),
            });

          if (memberError) throw memberError;

          toast({
            title: "User Added",
            description: `${addUserForm.firstName} ${addUserForm.lastName} has been added to the organization directly. A temporary password has been generated and they will need to reset it on first login.`,
          });
        }
      }

      // Reset form
      setAddUserForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'learner',
      });

      setShowAddUserForm(false);
      await fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user.",
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const generateInviteToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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

  const canDeleteUser = (targetUser: OrganizationUser) => {
    // Cannot delete yourself
    if (targetUser.id === user?.id) return false;
    // Cannot delete the organization creator
    if (targetUser.id === currentOrganization?.created_by) return false;
    return true;
  };

  if (!currentOrganization) {
    return (
      <Card>
        <div className="text-center p-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">No Organization Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select an organization to manage users.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <UserManagementHeader
          organizationName={currentOrganization.name}
          showAddUserForm={showAddUserForm}
          onToggleAddUser={() => setShowAddUserForm(!showAddUserForm)}
        />
        <CardContent className="space-y-4">
          {showAddUserForm && (
            <AddUserInlineForm
              formData={addUserForm}
              isLoading={isAddingUser}
              sendInvite={sendInvite}
              onFormChange={setAddUserForm}
              onSendInviteChange={setSendInvite}
              onSubmit={handleAddUser}
            />
          )}

          <UserFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onRoleFilterChange={setRoleFilter}
          />

          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>

          <UserManagementTable
            users={filteredUsers}
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            currentUserId={user?.id}
            organizationCreatedBy={currentOrganization?.created_by}
            userRole={userRole}
            onSort={handleSort}
            onRoleUpdate={handleRoleUpdate}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={(user) => {
              setSelectedUser(user);
              setShowUserDetails(true);
            }}
            onManageRestrictions={(user) => {
              setSelectedUser(user);
              setShowRestrictions(true);
            }}
            onPasswordReset={(user) => {
              setSelectedUser(user);
              setShowPasswordReset(true);
            }}
            onDeleteUser={setUserToDelete}
          />
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToDelete?.first_name} {userToDelete?.last_name} ({userToDelete?.email}) from this organization? 
              This action cannot be undone and they will lose access to all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
