
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserPlus, Share2, Settings, Copy, Link, Trash2, Plus, Clock, Hash, Lock, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollaboratorInfo } from '@/hooks/useCollaborativeEditing';
import { useInviteLinks } from '@/hooks/collaboration/useInviteLinks';

interface CollaborationDialogProps {
  setId: string;
  collaborators: CollaboratorInfo[];
  isCollaborative: boolean;
  onEnableCollaboration: () => Promise<boolean>;
  onRemoveCollaborator?: (collaboratorId: string) => Promise<boolean>;
  trigger?: React.ReactNode;
}

export const CollaborationDialog: React.FC<CollaborationDialogProps> = ({
  setId,
  collaborators,
  isCollaborative,
  onEnableCollaboration,
  onRemoveCollaborator,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [expiresIn, setExpiresIn] = useState<string>('24');
  const [maxUses, setMaxUses] = useState<string>('');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const { toast } = useToast();

  const {
    inviteLinks,
    isCreating,
    fetchInviteLinks,
    createInviteLink,
    deactivateInviteLink,
  } = useInviteLinks({ setId });

  useEffect(() => {
    if (isOpen && isCollaborative) {
      fetchInviteLinks();
    }
  }, [isOpen, isCollaborative]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleCreateInviteLink = async () => {
    const expiresInHours = expiresIn === 'never' ? undefined : parseInt(expiresIn);
    const maxUsesNum = maxUses ? parseInt(maxUses) : undefined;
    const linkPassword = usePassword ? password : undefined;

    if (usePassword && !password) {
      toast({
        title: "Error",
        description: "Please enter a password or generate one.",
        variant: "destructive",
      });
      return;
    }

    const inviteUrl = await createInviteLink(inviteRole, expiresInHours, maxUsesNum, linkPassword);
    
    if (inviteUrl) {
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Invite Link Created",
        description: usePassword 
          ? `The invite link has been copied to your clipboard! Password: ${password}`
          : "The invite link has been copied to your clipboard!",
      });
      
      // Reset form
      setUsePassword(false);
      setPassword('');
      setMaxUses('');
    } else {
      toast({
        title: "Error",
        description: "Failed to create invite link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard!",
    });
  };

  const handleDeactivateLink = async (linkId: string) => {
    const success = await deactivateInviteLink(linkId);
    if (success) {
      toast({
        title: "Link Deactivated",
        description: "The invite link has been deactivated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to deactivate link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnableCollaboration = async () => {
    setIsEnabling(true);
    try {
      const success = await onEnableCollaboration();
      if (success) {
        toast({
          title: "Collaboration Enabled",
          description: "This deck is now collaborative. You can create invite links to share with others.",
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

  const formatExpiryTime = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never';
    return new Date(expiresAt).toLocaleDateString();
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
            {/* Create Invite Link Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                <Label className="text-sm font-medium">Create Invite Link</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'editor' | 'viewer') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Expires</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Max Uses (optional)</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="use-password" 
                    checked={usePassword} 
                    onCheckedChange={(checked) => setUsePassword(checked as boolean)}
                  />
                  <Label htmlFor="use-password" className="text-sm">Password protect this link</Label>
                </div>

                {usePassword && (
                  <div className="space-y-2">
                    <Label className="text-xs">Password</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateRandomPassword}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCreateInviteLink} 
                disabled={isCreating}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Invite Link'}
              </Button>
            </div>

            <Separator />

            {/* Active Invite Links */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <Label className="text-sm font-medium">Active Invite Links ({inviteLinks.filter(link => link.is_active).length})</Label>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {inviteLinks.filter(link => link.is_active).map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(link.role)}>
                          {link.role}
                        </Badge>
                        {link.password_hash && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">
                          {link.invite_token}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatExpiryTime(link.expires_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {link.current_uses}{link.max_uses ? `/${link.max_uses}` : ''} uses
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(link.invite_token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivateLink(link.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {inviteLinks.filter(link => link.is_active).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No active invite links. Create one above to start inviting collaborators!
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Current Collaborators */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                        {collaborator.role}
                      </Badge>
                      {onRemoveCollaborator && collaborator.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCollaborator(collaborator.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {collaborators.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No collaborators yet. Create an invite link to get started!
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
