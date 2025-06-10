
import { useRef, useState, useEffect } from 'react';

type Position = 'left' | 'very-top' | 'canvas-left' | 'floating';
type SnapZone = 'left' | 'very-top' | 'canvas-left' | null;

interface UseToolbarPositioningProps {
  canvasRef?: React.RefObject<HTMLDivElement>;
  onPositionChange?: (position: Position, isDocked: boolean) => void;
}

export const useToolbarPositioning = ({ canvasRef, onPositionChange }: UseToolbarPositioningProps) => {
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState<Position>('canvas-left');
  const [dragPosition, setDragPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleToggleDock = () => {
    const newIsDocked = !isDocked;
    setIsDocked(newIsDocked);
    if (!newIsDocked) {
      setPosition('floating');
      onPositionChange?.('floating', false);
    } else {
      setPosition('canvas-left');
      onPositionChange?.('canvas-left', true);
    }
    setSnapZone(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked || !toolbarRef.current) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const getDockedPosition = () => {
    const canvasRect = canvasRef?.current?.getBoundingClientRect();
    
    switch (position) {
      case 'left':
        return {
          position: 'fixed' as const,
          left: '8px',
          top: '300px', // Moved down by 200px from original 100px
          zIndex: 50
        };
      case 'very-top':
        return {
          position: 'fixed' as const,
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60
        };
      case 'canvas-left':
        return {
          position: 'absolute' as const,
          left: '16px',
          top: '16px',
          zIndex: 50
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isDocked) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setDragPosition({ x: newX, y: newY });

      // Check for snap zones
      const snapThreshold = 60;
      const toolbarRect = toolbarRef.current?.getBoundingClientRect();
      const toolbarCenterX = newX + (toolbarRect?.width || 0) / 2;
      const toolbarCenterY = newY + (toolbarRect?.height || 0) / 2;
      
      let currentSnapZone: SnapZone = null;

      // Left snap zone - moved down and shortened
      const distanceToLeft = Math.abs(newX);
      if (distanceToLeft < snapThreshold && toolbarCenterY > 250 && toolbarCenterY < window.innerHeight - 100) {
        currentSnapZone = 'left';
      }
      
      // Very top snap zone - check if close to top edge of screen
      const distanceToTop = Math.abs(newY);
      if (distanceToTop < snapThreshold && toolbarCenterX > 50 && toolbarCenterX < window.innerWidth - 50) {
        currentSnapZone = 'very-top';
      }

      // Canvas-left snap zone - check if close to canvas area
      const canvasRect = canvasRef?.current?.getBoundingClientRect();
      if (canvasRect) {
        const distanceToCanvasLeft = Math.abs(newX - (canvasRect.left + 16)); // 16px padding
        const isWithinCanvasHeight = toolbarCenterY > canvasRect.top + 16 && toolbarCenterY < canvasRect.bottom - 16;
        if (distanceToCanvasLeft < snapThreshold && isWithinCanvasHeight) {
          currentSnapZone = 'canvas-left';
        }
      }

      setSnapZone(currentSnapZone);
      if (currentSnapZone) {
        setPosition(currentSnapZone);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Dock if we're in a snap zone
        if (snapZone) {
          setIsDocked(true);
          setPosition(snapZone);
          onPositionChange?.(snapZone, true);
        } else {
          onPositionChange?.('floating', false);
        }
        
        setSnapZone(null);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isDocked, snapZone, onPositionChange, canvasRef]);

  return {
    isDocked,
    position,
    dragPosition,
    isDragging,
    snapZone,
    toolbarRef,
    handleToggleDock,
    handleMouseDown,
    getDockedPosition
  };
};
