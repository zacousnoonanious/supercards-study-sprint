
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInviteLinks } from '@/hooks/collaboration/useInviteLinks';

interface JoinDeckDialogProps {
  trigger?: React.ReactNode;
}

export const JoinDeckDialog: React.FC<JoinDeckDialogProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const { toast } = useToast();
  const { joinDeckViaInvite } = useInviteLinks({ setId: '' }); // setId not needed for joining

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
        setIsOpen(false);
        setInviteCode('');
        setPassword('');
        setRequiresPassword(false);
        // Refresh the page to show the new deck
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

  const handleClose = () => {
    setIsOpen(false);
    setInviteCode('');
    setPassword('');
    setRequiresPassword(false);
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
            Join a Deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
