
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Plus, X } from 'lucide-react';

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrganizationDialog: React.FC<OrganizationDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useI18n();
  const { createOrganization, joinOrganization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  // Create Org state
  const [name, setName] = useState('');
  const [approvedDomains, setApprovedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join Org state
  const [orgId, setOrgId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const resetForms = () => {
    setName('');
    setApprovedDomains([]);
    setNewDomain('');
    setOrgId('');
  }

  const handleClose = () => {
    if (!isCreating && !isJoining) {
      resetForms();
      onOpenChange(false);
    }
  };

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

  const handleCreateKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
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
        
        handleClose();
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

  const handleJoin = async () => {
    if (!orgId.trim()) {
      toast({
        title: t('common.error'),
        description: t('common.orgIdRequired'),
        variant: 'destructive',
      });
      return;
    }
    if (!user?.email) {
      toast({
        title: t('common.error'),
        description: t('common.unexpectedError'),
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    const result = await joinOrganization(orgId.trim(), user.email);
    setIsJoining(false);

    if (result.success) {
      toast({
        title: t('common.success'),
        description: result.message,
      });
      handleClose();
    } else {
      toast({
        title: t('common.failedToJoin'),
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {t('common.organization')}
          </DialogTitle>
          <DialogDescription>
            {t('common.createOrJoinOrgDescription')}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="create" className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">{t('common.createOrganization')}</TabsTrigger>
            <TabsTrigger value="join">{t('common.joinOrganization')}</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-4 pt-4">
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
              <p className="text-sm text-muted-foreground">
                {t('common.approvedEmailDomainsDescription')}
              </p>
              <div className="flex gap-2">
                <Input
                  id="domain-input"
                  type="text"
                  placeholder={t('common.domainPlaceholder')}
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={handleCreateKeyPress}
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
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={isCreating}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('common.creating')}...</>
                ) : (
                  t('common.createOrganization')
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="join" className="pt-4">
             <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="org-id">
                        {t('common.organizationId')}
                    </Label>
                    <Input
                        id="org-id"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        placeholder={t('common.organizationIdPlaceholder')}
                        disabled={isJoining}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose} disabled={isJoining}>
                    {t('common.cancel')}
                </Button>
                <Button onClick={handleJoin} disabled={isJoining}>
                {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.joinOrganization')}
                </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
