
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface AddUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AddUserInlineFormProps {
  formData: AddUserFormData;
  isLoading: boolean;
  onFormChange: (data: AddUserFormData) => void;
  onSubmit: () => void;
}

export const AddUserInlineForm: React.FC<AddUserInlineFormProps> = ({
  formData,
  isLoading,
  onFormChange,
  onSubmit,
}) => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div>
            <Select value={formData.role} onValueChange={(value) => onFormChange({ ...formData, role: value })}>
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
          <div>
            <Button 
              onClick={onSubmit} 
              disabled={isLoading || !formData.email}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
