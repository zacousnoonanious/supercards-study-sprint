
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [name, setName] = useState('');
  const [approvedDomains, setApprovedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createOrganization } = useOrganization();

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase();
    if (approvedDomains.includes(domain)) {
      toast({
        title: "Domain already added",
        description: "This domain is already in the list.",
        variant: "destructive",
      });
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain (e.g., company.com)",
        variant: "destructive",
      });
      return;
    }

    setApprovedDomains([...approvedDomains, domain]);
    setNewDomain('');
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setApprovedDomains(approvedDomains.filter(d => d !== domainToRemove));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an organization name.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const org = await createOrganization(name.trim(), approvedDomains);
      
      if (org) {
        toast({
          title: "Success!",
          description: `Organization "${org.name}" has been created.`,
        });
        
        // Reset form
        setName('');
        setApprovedDomains([]);
        setNewDomain('');
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create organization. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setApprovedDomains([]);
      setNewDomain('');
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Create Organization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              type="text"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain-input">Approved Email Domains (Optional)</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Users with these email domains will automatically join your organization.
            </div>
            <div className="flex gap-2">
              <Input
                id="domain-input"
                type="text"
                placeholder="company.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
              <Button onClick={handleAddDomain} size="sm" disabled={isCreating}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {approvedDomains.length > 0 && (
            <div className="space-y-2">
              <Label>Added Domains</Label>
              <div className="flex flex-wrap gap-2">
                {approvedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                    {domain}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => handleRemoveDomain(domain)}
                      disabled={isCreating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
