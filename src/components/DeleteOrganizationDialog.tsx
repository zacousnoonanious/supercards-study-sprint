
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface DeleteOrganizationDialogProps {
  trigger?: React.ReactNode;
  organizationName?: string;
  organizationId?: string;
}

export const DeleteOrganizationDialog: React.FC<DeleteOrganizationDialogProps> = ({
  trigger,
  organizationName,
  organizationId
}) => {
  const { deleteOrganization, currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const orgName = organizationName || currentOrganization?.name || '';
  const orgId = organizationId || currentOrganization?.id || '';

  const handleDelete = async () => {
    if (confirmText !== orgName) {
      toast({
        title: "Confirmation Error",
        description: "Please type the organization name exactly as shown.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteOrganization(orgId);
      if (success) {
        toast({
          title: "Organization Deleted",
          description: "The organization and all associated data have been removed.",
        });
        setOpen(false);
        setConfirmText('');
      } else {
        toast({
          title: "Error",
          description: "Failed to delete organization. You may not have permission.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the organization.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Organization
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              This action will permanently delete the organization <strong>{orgName}</strong> and:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Remove all members from the organization</li>
              <li>Cancel all pending invitations</li>
              <li>Remove organization reference from flashcard sets (sets remain with creators)</li>
              <li>Remove organization data from all associated records</li>
            </ul>
            <div className="text-red-600 font-medium">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="confirm-text">
              Type <span className="font-bold">{orgName}</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={orgName}
              className="mt-1"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText('')}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== orgName || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Organization'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
