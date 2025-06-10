
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
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        data-canvas-background="true"
      />
    );
  }

  const gridColor = isDarkTheme ? '#4B5563' : '#D1D5DB';
  
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: '0 0, 0 0',
        opacity: 0.8,
        zIndex: 1,
      }}
      data-canvas-background="true"
    />
  );
};
