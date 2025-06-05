
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const KeyboardShortcutsTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  const shortcuts = [
    { key: 'Delete', description: 'Delete selected element' },
    { key: 'Ctrl/Cmd + A', description: 'Select all elements' },
    { key: 'Ctrl/Cmd + O', description: 'Auto arrange elements' },
    { key: 'Ctrl/Cmd + T', description: 'Add text element' },
    { key: 'Ctrl/Cmd + I', description: 'Add image element' },
    { key: 'Ctrl/Cmd + U', description: 'Add audio element' },
    { key: 'Double click', description: 'Edit text element' },
    { key: 'Escape', description: 'Exit text editing mode' },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <HelpCircle className="w-4 h-4" />
      </Button>
      
      {isVisible && (
        <Card className={`absolute bottom-full mb-2 right-0 z-50 w-64 shadow-lg ${
          isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <CardContent className="p-3">
            <h4 className={`text-sm font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Keyboard Shortcuts
            </h4>
            <div className="space-y-1">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className={`font-mono ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                    {shortcut.key}
                  </span>
                  <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-500'}>
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
