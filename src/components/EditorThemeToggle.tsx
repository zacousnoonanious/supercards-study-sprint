
import React from 'react';
import { useEditorTheme } from '@/contexts/EditorThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export const EditorThemeToggle = () => {
  const { editorTheme, setEditorTheme } = useEditorTheme();

  const toggleTheme = () => {
    setEditorTheme(editorTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {editorTheme === 'light' ? (
        <>
          <Moon className="w-4 h-4" />
          Dark Mode
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          Light Mode
        </>
      )}
    </Button>
  );
};
