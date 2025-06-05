
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const KeyboardShortcutsHelp: React.FC = () => {
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="w-64">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
            <div className="space-y-1">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="font-mono bg-muted px-1 rounded">
                    {shortcut.key}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
