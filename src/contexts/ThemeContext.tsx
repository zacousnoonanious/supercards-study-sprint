
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuroraThemeEffects } from '@/components/AuroraThemeEffects';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'red' | 'winterland' | 'cobalt' | 'darcula' | 'console' | 'high-contrast' | 'aurora';
type Size = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  size: Size;
  setTheme: (theme: Theme) => void;
  setSize: (size: Size) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'light';
  });

  const [size, setSize] = useState<Size>(() => {
    const saved = localStorage.getItem('app-size');
    return (saved as Size) || 'medium';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'blue', 'green', 'red', 'winterland', 'cobalt', 'darcula', 'console', 'high-contrast', 'aurora');
    root.classList.remove('size-small', 'size-medium', 'size-large');
    
    // Add current theme and size classes
    root.classList.add(theme);
    root.classList.add(`size-${size}`);
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-size', size);
  }, [theme, size]);

  const value = {
    theme,
    size,
    setTheme,
    setSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {theme === 'aurora' && <AuroraThemeEffects />}
      {children}
    </ThemeContext.Provider>
  );
};
