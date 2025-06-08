
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Info } from 'lucide-react';

interface InformationalCardGuardProps {
  open: boolean;
  onClose: () => void;
}

export const InformationalCardGuard: React.FC<InformationalCardGuardProps> = ({
  open,
  onClose,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Informational Card - Single Side Only
          </AlertDialogTitle>
          <AlertDialogDescription>
            This is an informational card type, which only has a front side. 
            Informational cards are designed to display content without requiring users to flip or answer questions.
            <br /><br />
            You cannot edit the back side of an informational card.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Understood
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
