
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CanvasBackgroundProps {
  cardSide: 'front' | 'back';
  snapToGrid: boolean;
  gridSize: number;
  onSnapToGridToggle: () => void;
  onAutoArrange: () => void;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  cardSide,
  snapToGrid,
  gridSize,
  onSnapToGridToggle,
  onAutoArrange,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  return (
    <div className={`absolute inset-0 border-2 border-dashed rounded-lg ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
    }`}>
      {snapToGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at ${gridSize}px ${gridSize}px, ${isDarkTheme ? '#ffffff' : '#000000'} 1px, transparent 0),
              radial-gradient(circle at 0 0, ${isDarkTheme ? '#ffffff' : '#000000'} 1px, transparent 0)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}
      <div className={`absolute top-2 left-2 text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`}>
        {cardSide} side
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={onSnapToGridToggle}
          className={`px-2 py-1 text-xs rounded ${
            snapToGrid 
              ? 'bg-blue-500 text-white' 
              : isDarkTheme 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          Grid: {snapToGrid ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={onAutoArrange}
          className={`px-2 py-1 text-xs rounded ${
            isDarkTheme 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Auto Arrange
        </button>
      </div>
    </div>
  );
};
