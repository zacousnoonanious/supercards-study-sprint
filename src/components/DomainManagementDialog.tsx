
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface DomainManagementDialogProps {
  trigger?: React.ReactNode;
}

export const DomainManagementDialog: React.FC<DomainManagementDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { currentOrganization, updateApprovedDomains } = useOrganization();

  useEffect(() => {
    if (currentOrganization?.approved_domains) {
      setDomains(currentOrganization.approved_domains);
    }
  }, [currentOrganization]);

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase();
    if (domains.includes(domain)) {
      toast({
        title: "Domain already exists",
        description: "This domain is already in the approved list.",
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

    setDomains([...domains, domain]);
    setNewDomain('');
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setDomains(domains.filter(d => d !== domainToRemove));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setIsUpdating(true);
    try {
      const success = await updateApprovedDomains(currentOrganization.id, domains);
      
      if (success) {
        toast({
          title: "Success",
          description: "Approved domains updated successfully.",
        });
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update approved domains. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage Domains
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Approved Email Domains
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Users with email addresses from these domains will automatically join your organization. 
            Others will need admin approval.
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-domain">Add Domain</Label>
            <div className="flex gap-2">
              <Input
                id="new-domain"
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleAddDomain} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Approved Domains</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {domains.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No approved domains. All users will need admin approval.
                </div>
              ) : (
                domains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                    {domain}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => handleRemoveDomain(domain)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
