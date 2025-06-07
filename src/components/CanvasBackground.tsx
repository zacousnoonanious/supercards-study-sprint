
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CanvasBackgroundProps {
  cardSide: 'front' | 'back';
  snapToGrid: boolean;
  gridSize: number;
  onSnapToGridToggle: () => void;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  cardSide,
  snapToGrid,
  gridSize,
  onSnapToGridToggle,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Grid Pattern (if enabled) */}
      {snapToGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px),
              linear-gradient(to bottom, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Card Side Indicator */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
        }`}>
          {cardSide === 'front' ? 'Front' : 'Back'}
        </div>
      </div>

      {/* Grid Toggle Button */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onSnapToGridToggle}
          className="h-8 w-8 p-0"
          title={snapToGrid ? 'Hide Grid' : 'Show Grid'}
        >
          {snapToGrid ? <EyeOff className="w-3 h-3" /> : <Grid className="w-3 h-3" />}
        </Button>
      </div>
    </>
  );
};
