
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Mail, User } from 'lucide-react';

interface AddUserInlineFormProps {
  formData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  isLoading: boolean;
  sendInvite: boolean;
  onFormChange: (data: any) => void;
  onSendInviteChange: (sendInvite: boolean) => void;
  onSubmit: () => void;
}

export const AddUserInlineForm: React.FC<AddUserInlineFormProps> = ({
  formData,
  isLoading,
  sendInvite,
  onFormChange,
  onSendInviteChange,
  onSubmit,
}) => {
  const handleFormChange = (field: string, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Add New User</h3>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <Label htmlFor="send-invite" className="text-sm">Direct Add</Label>
              <Switch
                id="send-invite"
                checked={!sendInvite}
                onCheckedChange={(checked) => onSendInviteChange(!checked)}
              />
              <Mail className="w-4 h-4" />
              <Label htmlFor="send-invite" className="text-sm">Send Invite</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleFormChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={onSubmit}
                disabled={isLoading || !formData.email || !formData.firstName || !formData.lastName}
                className="w-full"
              >
                {isLoading ? 'Adding...' : sendInvite ? 'Send Invite' : 'Add User'}
              </Button>
            </div>
          </div>

          {!sendInvite && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Direct Add:</strong> User will be created immediately with a temporary password. 
                They will need to reset their password on first login.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
