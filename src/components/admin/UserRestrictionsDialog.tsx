
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Eye, Plus, MessageCircle, MessageSquare, KeyRound } from 'lucide-react';

interface UserRestrictionsDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    restrictions?: {
      view_only_mode: boolean;
      block_deck_creation: boolean;
      disable_chat: boolean;
      disable_comments: boolean;
      can_change_own_password?: boolean;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const UserRestrictionsDialog: React.FC<UserRestrictionsDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [restrictions, setRestrictions] = useState({
    view_only_mode: false,
    block_deck_creation: false,
    disable_chat: false,
    disable_comments: false,
    can_change_own_password: false,
  });

  useEffect(() => {
    if (user.restrictions) {
      setRestrictions({
        view_only_mode: user.restrictions.view_only_mode || false,
        block_deck_creation: user.restrictions.block_deck_creation || false,
        disable_chat: user.restrictions.disable_chat || false,
        disable_comments: user.restrictions.disable_comments || false,
        can_change_own_password: user.restrictions.can_change_own_password || false,
      });
    } else {
      setRestrictions({
        view_only_mode: false,
        block_deck_creation: false,
        disable_chat: false,
        disable_comments: false,
        can_change_own_password: false,
      });
    }
  }, [user.restrictions]);

  const handleSave = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_restrictions')
        .upsert({
          user_id: user.id,
          organization_id: currentOrganization.id,
          view_only_mode: restrictions.view_only_mode,
          block_deck_creation: restrictions.block_deck_creation,
          disable_chat: restrictions.disable_chat,
          disable_comments: restrictions.disable_comments,
          can_change_own_password: restrictions.can_change_own_password,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'user_id,organization_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User restrictions have been updated.",
      });
      
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating restrictions:', error);
      toast({
        title: "Error",
        description: "Failed to update user restrictions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const userName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manage User Restrictions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User: {userName}</CardTitle>
              <CardDescription>
                Configure access restrictions for this user within the organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="view-only" className="text-sm font-medium">
                      View Only Mode
                    </Label>
                  </div>
                  <Switch
                    id="view-only"
                    checked={restrictions.view_only_mode}
                    onCheckedChange={(checked) =>
                      setRestrictions(prev => ({ ...prev, view_only_mode: checked }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  User can only view content but cannot make any changes or edits.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="block-creation" className="text-sm font-medium">
                      Block Deck Creation
                    </Label>
                  </div>
                  <Switch
                    id="block-creation"
                    checked={restrictions.block_deck_creation}
                    onCheckedChange={(checked) =>
                      setRestrictions(prev => ({ ...prev, block_deck_creation: checked }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Prevent user from creating new flashcard decks.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="disable-chat" className="text-sm font-medium">
                      Disable Chat
                    </Label>
                  </div>
                  <Switch
                    id="disable-chat"
                    checked={restrictions.disable_chat}
                    onCheckedChange={(checked) =>
                      setRestrictions(prev => ({ ...prev, disable_chat: checked }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Block access to chat features (for future use).
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="disable-comments" className="text-sm font-medium">
                      Disable Comments
                    </Label>
                  </div>
                  <Switch
                    id="disable-comments"
                    checked={restrictions.disable_comments}
                    onCheckedChange={(checked) =>
                      setRestrictions(prev => ({ ...prev, disable_comments: checked }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Prevent user from posting comments (for future use).
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="allow-password-change" className="text-sm font-medium">
                      Allow Self-service Password Change
                    </Label>
                  </div>
                  <Switch
                    id="allow-password-change"
                    checked={restrictions.can_change_own_password}
                    onCheckedChange={(checked) =>
                      setRestrictions(prev => ({ ...prev, can_change_own_password: checked }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Allow user to change their own password from their profile settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Restrictions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
