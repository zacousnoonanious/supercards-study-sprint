
import React from 'react';

interface CanvasBackgroundProps {
  /** Whether to show the grid overlay */
  showGrid?: boolean;
  /** Size of grid squares in pixels */
  gridSize?: number;
  /** Whether the current theme is dark */
  isDarkTheme?: boolean;
}

/**
 * CanvasBackground Component
 * 
 * Renders the background grid for the canvas editor.
 * CRITICAL: This component is essential for visual editing as it provides
 * the grid reference that users rely on for precise element positioning.
 * 
 * Features:
 * - Responsive grid rendering based on gridSize
 * - Theme-aware grid colors
 * - Proper opacity for non-intrusive display
 * - Pointer events disabled to prevent interaction interference
 * 
 * @param showGrid - Controls grid visibility
 * @param gridSize - Size of each grid square (default: 20px)
 * @param isDarkTheme - Determines grid color scheme
 */
export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  showGrid = false,
  gridSize = 20,
  isDarkTheme = false,
}) => {
  // Add comprehensive logging for debugging
  React.useEffect(() => {
    console.log('🎨 CanvasBackground render:', {
      showGrid,
      gridSize,
      isDarkTheme,
      timestamp: new Date().toISOString()
    });
  }, [showGrid, gridSize, isDarkTheme]);

  // Validate gridSize to prevent rendering issues
  const validatedGridSize = React.useMemo(() => {
    if (typeof gridSize !== 'number' || gridSize <= 0) {
      console.warn('⚠️ CanvasBackground: Invalid gridSize, using default 20px');
      return 20;
    }
    return gridSize;
  }, [gridSize]);

  // Calculate grid colors based on theme
  const gridColor = React.useMemo(() => {
    const color = isDarkTheme ? '#4B5563' : '#D1D5DB'; // gray-600 for dark, gray-300 for light
    console.log('🎨 Grid color calculated:', color, 'for theme:', isDarkTheme ? 'dark' : 'light');
    return color;
  }, [isDarkTheme]);

  // If grid is not shown, render transparent background
  if (!showGrid) {
    console.log('🎨 Grid disabled - rendering transparent background');
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        data-canvas-background="true"
        aria-hidden="true"
      />
    );
  }

  console.log('🎨 Grid enabled - rendering grid pattern with size:', validatedGridSize);

  /**
   * Grid rendering with CSS background patterns
   * Uses linear gradients to create grid lines for optimal performance
   */
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: `${validatedGridSize}px ${validatedGridSize}px`,
        backgroundPosition: '0 0, 0 0',
        opacity: 0.4, // Subtle visibility to not interfere with content
        zIndex: 0, // Ensure grid stays behind content
      }}
      data-canvas-background="true"
      aria-hidden="true"
      role="presentation"
    />
  );
};
