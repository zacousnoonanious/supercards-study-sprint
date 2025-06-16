
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export const KeyboardShortcutsHelper: React.FC = () => {
  const shortcuts = [
    { key: 'T', description: 'Add text element' },
    { key: 'I', description: 'Add image element' },
    { key: 'A', description: 'Add audio element' },
    { key: 'Y', description: 'Add YouTube element' },
    { key: 'M', description: 'Add multiple choice element' },
    { key: 'Delete', description: 'Delete selected element' },
    { key: 'Ctrl + ←', description: 'Previous card' },
    { key: 'Ctrl + →', description: 'Next card' },
    { key: 'Ctrl + ↑', description: 'Switch to front side' },
    { key: 'Ctrl + ↓', description: 'Switch to back side' },
    { key: 'Ctrl + S', description: 'Save card' },
    { key: 'Ctrl + N', description: 'New card' },
    { key: 'Ctrl + G', description: 'Auto arrange (grid)' },
    { key: 'Ctrl + O', description: 'Card overview' },
    { key: 'Ctrl + C', description: 'Copy element' },
    { key: 'Ctrl + V', description: 'Paste element' },
    { key: 'Space', description: 'Element options (when selected)' },
    { key: 'Double click', description: 'Edit text element' },
    { key: 'Escape', description: 'Deselect / Exit editing' },
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-80 p-0">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                      {shortcut.key}
                    </span>
                    <span className="text-muted-foreground flex-1 ml-3">
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
