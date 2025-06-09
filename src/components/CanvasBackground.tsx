
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CanvasBackgroundProps {
  showGrid?: boolean;
  gridSize?: number;
  isDarkTheme?: boolean;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  showGrid = false,
  gridSize = 20,
  isDarkTheme = false,
}) => {
  return (
    <>
      {/* Grid Pattern (if enabled) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${isDarkTheme ? '#374151' : '#e5e7eb'} 1px, transparent 1px),
              linear-gradient(to bottom, ${isDarkTheme ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}
    </>
  );
};
