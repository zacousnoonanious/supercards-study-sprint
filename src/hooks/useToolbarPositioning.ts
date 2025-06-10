
import { useRef, useState } from 'react';

type Position = 'left' | 'very-top' | 'canvas-left' | 'floating';

interface UseToolbarPositioningProps {
  canvasRef?: React.RefObject<HTMLDivElement>;
  onPositionChange?: (position: Position, isDocked: boolean) => void;
}

export const useToolbarPositioning = ({ canvasRef, onPositionChange }: UseToolbarPositioningProps) => {
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<Position>('left');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Simplified for embedded toolbar - no floating functionality
  const handleToggleDock = () => {
    // For embedded toolbar, we don't need undocking functionality
    onPositionChange?.(position, true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // No dragging for embedded toolbar
  };

  const getDockedPosition = () => {
    // Return empty object since positioning is handled by CSS layout
    return {};
  };

  return {
    isDocked: true,
    position,
    dragPosition: { x: 0, y: 0 },
    isDragging: false,
    snapZone: null,
    toolbarRef,
    handleToggleDock,
    handleMouseDown,
    getDockedPosition
  };
};
