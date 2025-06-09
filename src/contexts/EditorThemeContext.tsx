
import React, { createContext, useContext, useState, useEffect } from 'react';

type EditorTheme = 'light' | 'dark';

interface EditorThemeContextType {
  editorTheme: EditorTheme;
  setEditorTheme: (theme: EditorTheme) => void;
}

const EditorThemeContext = createContext<EditorThemeContextType | undefined>(undefined);

export const useEditorTheme = () => {
  const context = useContext(EditorThemeContext);
  if (context === undefined) {
    throw new Error('useEditorTheme must be used within an EditorThemeProvider');
  }
  return context;
};

export const EditorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(() => {
    const saved = localStorage.getItem('editor-theme');
    return (saved as EditorTheme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('editor-theme', editorTheme);
  }, [editorTheme]);

  const value = {
    editorTheme,
    setEditorTheme,
  };

  return (
    <EditorThemeContext.Provider value={value}>
      {children}
    </EditorThemeContext.Provider>
  );
};
