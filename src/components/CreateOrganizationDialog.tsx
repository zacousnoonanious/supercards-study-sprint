
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useI18n } from '@/contexts/I18nContext';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [approvedDomains, setApprovedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createOrganization } = useOrganization();
  const { t } = useI18n();

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    
    const domain = newDomain.trim().toLowerCase();
    if (approvedDomains.includes(domain)) {
      toast({
        title: t('common.domainAlreadyAdded'),
        description: t('common.domainAlreadyAddedDescription'),
        variant: "destructive",
      });
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast({
        title: t('common.invalidDomain'),
        description: t('common.invalidDomainDescription'),
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
        title: t('common.nameRequired'),
        description: t('common.nameRequiredDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const org = await createOrganization(name.trim(), approvedDomains);
      
      if (org) {
        toast({
          title: t('common.success') + "!",
          description: t('common.orgCreatedSuccess', { name: org.name }),
        });
        
        // Reset form
        setName('');
        setApprovedDomains([]);
        setNewDomain('');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: t('common.error'),
          description: t('common.failedToCreateOrg'),
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
            {t('common.createOrganization')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">{t('common.organizationName')}</Label>
            <Input
              id="org-name"
              type="text"
              placeholder={t('common.organizationNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain-input">{t('common.approvedEmailDomainsOptional')}</Label>
            <div className="text-sm text-muted-foreground mb-2">
              {t('common.approvedEmailDomainsDescription')}
            </div>
            <div className="flex gap-2">
              <Input
                id="domain-input"
                type="text"
                placeholder={t('common.domainPlaceholder')}
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
              <Label>{t('common.addedDomains')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.creating')}...
                </>
              ) : (
                t('common.createOrganization')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
