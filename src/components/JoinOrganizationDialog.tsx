
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface JoinOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinOrganizationDialog: React.FC<JoinOrganizationDialogProps> = ({ open, onOpenChange }) => {
  const [orgId, setOrgId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinOrganization } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

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
      onOpenChange(false);
      setOrgId('');
    } else {
      toast({
        title: t('common.failedToJoin'),
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>{t('common.joinOrganization')}</DialogTitle>
            <DialogDescription>{t('common.joinDescription')}</DialogDescription>
        </DialogHeader>
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
                />
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleJoin} disabled={isJoining}>
            {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.joinOrganization')}
            </Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
