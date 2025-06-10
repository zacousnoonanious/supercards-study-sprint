
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type SnapZone = 'left' | 'very-top' | 'canvas-left' | null;

interface SnapZoneIndicatorsProps {
  snapZone: SnapZone;
  isDragging: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const SnapZoneIndicators: React.FC<SnapZoneIndicatorsProps> = ({
  snapZone,
  isDragging,
  canvasRef
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const getSnapZoneStyle = (zone: SnapZone) => {
    if (snapZone !== zone) return { display: 'none' };
    
    const baseStyle = {
      position: 'fixed' as const,
      backgroundColor: isDarkTheme ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
      border: `2px dashed ${isDarkTheme ? '#60a5fa' : '#3b82f6'}`,
      pointerEvents: 'none' as const,
      zIndex: 40,
      borderRadius: '8px',
    };

    const canvasRect = canvasRef?.current?.getBoundingClientRect();

    switch (zone) {
      case 'left':
        return {
          ...baseStyle,
          left: 0,
          top: 100,
          width: 60,
          height: window.innerHeight - 100,
        };
      case 'very-top':
        return {
          ...baseStyle,
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: 60,
        };
      case 'canvas-left':
        return {
          ...baseStyle,
          left: canvasRect ? canvasRect.left + 16 : 100,
          top: canvasRect ? canvasRect.top + 16 : 200,
          width: 60,
          height: canvasRect ? Math.max(300, canvasRect.height - 32) : 400,
        };
      default:
        return { display: 'none' };
    }
  };

  if (!isDragging) return null;

  return (
    <>
      <div style={getSnapZoneStyle('left')} />
      <div style={getSnapZoneStyle('very-top')} />
      <div style={getSnapZoneStyle('canvas-left')} />
    </>
  );
};
