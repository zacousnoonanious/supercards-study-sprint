
import React from 'react';

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
  if (!showGrid) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${isDarkTheme ? '#4B5563' : '#D1D5DB'} 1px, transparent 1px),
          linear-gradient(to bottom, ${isDarkTheme ? '#4B5563' : '#D1D5DB'} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity: 0.6,
      }}
      data-canvas-background="true"
    />
  );
};
