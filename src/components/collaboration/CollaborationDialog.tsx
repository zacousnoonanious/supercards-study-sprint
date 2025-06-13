
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Share2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollaboratorInfo } from '@/hooks/useCollaborativeEditing';

interface CollaborationDialogProps {
  collaborators: CollaboratorInfo[];
  isCollaborative: boolean;
  onInviteCollaborator: (email: string, role: 'editor' | 'viewer') => Promise<boolean>;
  onEnableCollaboration: () => Promise<boolean>;
  trigger?: React.ReactNode;
}

export const CollaborationDialog: React.FC<CollaborationDialogProps> = ({
  collaborators,
  isCollaborative,
  onInviteCollaborator,
  onEnableCollaboration,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const success = await onInviteCollaborator(inviteEmail, inviteRole);
      if (success) {
        toast({
          title: "Invitation Sent",
          description: `Successfully invited ${inviteEmail} as ${inviteRole}.`,
        });
        setInviteEmail('');
      } else {
        toast({
          title: "User Not Found",
          description: "No user found with that email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleEnableCollaboration = async () => {
    setIsEnabling(true);
    try {
      const success = await onEnableCollaboration();
      if (success) {
        toast({
          title: "Collaboration Enabled",
          description: "This deck is now collaborative. You can invite others to edit with you.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to enable collaboration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable collaboration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Collaborate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Collaboration Settings
          </DialogTitle>
        </DialogHeader>

        {!isCollaborative ? (
          <div className="space-y-4">
            <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Enable Collaboration</h3>
              <p className="text-muted-foreground mb-4">
                Allow others to view and edit this deck with you in real-time.
              </p>
              <Button onClick={handleEnableCollaboration} disabled={isEnabling}>
                {isEnabling ? 'Enabling...' : 'Enable Collaboration'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Invite Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <Label className="text-sm font-medium">Invite Collaborators</Label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    type="email"
                  />
                </div>
                <Select value={inviteRole} onValueChange={(value: 'editor' | 'viewer') => setInviteRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                  {isInviting ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
            </div>

            {/* Current Collaborators */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <Label className="text-sm font-medium">Current Collaborators ({collaborators.length})</Label>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={collaborator.user_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(collaborator.user_name || 'Anonymous')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{collaborator.user_name || 'Anonymous User'}</p>
                      </div>
                    </div>
                    <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                  </div>
                ))}
                {collaborators.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No collaborators yet. Invite someone to get started!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
