
import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Delete', description: 'Delete selected element' },
    { key: 'Escape', description: 'Deselect element / Exit editing mode' },
    { key: 'Ctrl/Cmd + Z', description: 'Undo last action' },
    { key: 'Ctrl/Cmd + Y', description: 'Redo action' },
    { key: 'Ctrl/Cmd + S', description: 'Save card' },
    { key: 'Arrow Keys', description: 'Move selected element' },
    { key: 'Shift + Arrow Keys', description: 'Move element faster' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Keyboard Shortcuts
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {shortcut.key}
              </span>
              <span className="text-sm text-muted-foreground ml-4">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
