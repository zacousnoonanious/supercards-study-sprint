
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInviteLinks } from '@/hooks/collaboration/useInviteLinks';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

interface JoinDeckDialogProps {
  trigger?: React.ReactNode;
}

export const JoinDeckDialog: React.FC<JoinDeckDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [orgId, setOrgId] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [joinType, setJoinType] = useState<'deck' | 'organization'>('deck');
  const { toast } = useToast();
  const { joinDeckViaInvite } = useInviteLinks({ setId: '' });
  const { joinOrganization } = useOrganization();
  const { user } = useAuth();

  const handleJoinDeck = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinDeckViaInvite(inviteCode.trim(), password || undefined);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        handleClose();
        window.location.reload();
      } else {
        if (result.requiresPassword) {
          setRequiresPassword(true);
          toast({
            title: "Password Required",
            description: result.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Failed to Join",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!orgId.trim() || !user?.email) {
      toast({
        title: "Error",
        description: "Please enter an organization ID.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinOrganization(orgId.trim(), user.email);
      
      if (result.success) {
        toast({
          title: result.status === 'active' ? "Success!" : "Request Submitted",
          description: result.message,
        });
        
        if (result.status === 'active') {
          handleClose();
          window.location.reload();
        } else {
          handleClose();
        }
      } else {
        toast({
          title: "Failed to Join",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setInviteCode('');
    setOrgId('');
    setPassword('');
    setRequiresPassword(false);
    setJoinType('deck');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Join Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Join Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={joinType === 'deck' ? 'default' : 'outline'}
              onClick={() => setJoinType('deck')}
              className="flex-1"
              size="sm"
            >
              Join Deck
            </Button>
            <Button
              variant={joinType === 'organization' ? 'default' : 'outline'}
              onClick={() => setJoinType('organization')}
              className="flex-1"
              size="sm"
            >
              <Building className="w-4 h-4 mr-1" />
              Join Organization
            </Button>
          </div>

          {joinType === 'deck' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="Enter invite code (e.g., ABC12345)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </div>

              {requiresPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleJoinDeck} disabled={isJoining}>
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Join Deck
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="org-id">Organization ID</Label>
                <Input
                  id="org-id"
                  type="text"
                  placeholder="Enter organization ID"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Ask your organization admin for the organization ID.
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleJoinOrganization} disabled={isJoining}>
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Join Organization
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
