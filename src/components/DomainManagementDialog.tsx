
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Plus, X, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { validateDomain, isPublicDomain } from '@/utils/domainValidation';

interface DomainManagementDialogProps {
  trigger?: React.ReactNode;
}

export const DomainManagementDialog: React.FC<DomainManagementDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [domainValidation, setDomainValidation] = useState<{
    isValid: boolean;
    isPublic: boolean;
    warnings: string[];
  } | null>(null);
  const [showPublicDomainWarning, setShowPublicDomainWarning] = useState(false);
  const { toast } = useToast();
  const { currentOrganization, updateApprovedDomains } = useOrganization();

  useEffect(() => {
    if (currentOrganization?.approved_domains) {
      setDomains(currentOrganization.approved_domains);
    }
  }, [currentOrganization]);

  // Validate domain as user types
  useEffect(() => {
    if (newDomain.trim()) {
      const validation = validateDomain(newDomain.trim());
      setDomainValidation(validation);
    } else {
      setDomainValidation(null);
    }
  }, [newDomain]);

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

    const validation = validateDomain(domain);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid domain",
        description: validation.warnings[0] || "Please enter a valid domain (e.g., company.com)",
        variant: "destructive",
      });
      return;
    }

    // If it's a public domain, show additional warning
    if (validation.isPublic) {
      setShowPublicDomainWarning(true);
      return;
    }

    // Add domain if it passes validation
    setDomains([...domains, domain]);
    setNewDomain('');
    setDomainValidation(null);
  };

  const confirmAddPublicDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    setDomains([...domains, domain]);
    setNewDomain('');
    setDomainValidation(null);
    setShowPublicDomainWarning(false);
    
    toast({
      title: "Public domain added",
      description: "Users from this public domain will be able to auto-join your organization. Consider reviewing your security settings.",
      variant: "destructive",
    });
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

  const publicDomainsCount = domains.filter(isPublicDomain).length;

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
      <DialogContent className="sm:max-w-lg">
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

          {publicDomainsCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {publicDomainsCount} public domain(s) approved. This allows anyone with emails from these domains to auto-join your organization.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-domain">Add Domain</Label>
            <div className="flex gap-2">
              <Input
                id="new-domain"
                type="text"
                placeholder="company.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                className={domainValidation?.isPublic ? "border-yellow-300" : ""}
              />
              <Button onClick={handleAddDomain} size="sm" disabled={!domainValidation?.isValid}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {domainValidation && (
              <div className="space-y-2">
                {domainValidation.warnings.map((warning, index) => (
                  <Alert key={index} variant={domainValidation.isPublic ? "default" : "destructive"}>
                    {domainValidation.isPublic ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertDescription className="text-sm">
                      {warning}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
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
                  <Badge 
                    key={domain} 
                    variant={isPublicDomain(domain) ? "destructive" : "secondary"} 
                    className="flex items-center gap-1"
                  >
                    {domain}
                    {isPublicDomain(domain) && (
                      <AlertTriangle className="w-3 h-3" />
                    )}
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

        {/* Public Domain Warning Dialog */}
        <Dialog open={showPublicDomainWarning} onOpenChange={setShowPublicDomainWarning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Public Domain Warning
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You're about to add <strong>{newDomain}</strong>, which is a public email domain. 
                This means anyone with an email from this domain can automatically join your organization.
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Risk:</strong> This could allow unauthorized users to access your organization. 
                  Consider using your corporate domain instead.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPublicDomainWarning(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmAddPublicDomain}>
                  Add Anyway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
