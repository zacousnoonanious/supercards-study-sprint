
import { useEffect, useCallback } from 'react';

interface UseCanvasEventHandlersProps {
  isInCanvasArea: (target: Node) => boolean;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  setPanStart: (start: { x: number; y: number }) => void;
  panStart: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  updateCursor: (cursor: string) => void;
  zoom: number;
  handleWheel: (e: WheelEvent) => void;
  canvasViewportRef: React.RefObject<HTMLDivElement>;
}

export const useCanvasEventHandlers = ({
  isInCanvasArea,
  isPanning,
  setIsPanning,
  setPanStart,
  panStart,
  setPanOffset,
  updateCursor,
  zoom,
  handleWheel,
  canvasViewportRef,
}: UseCanvasEventHandlersProps) => {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isInCanvasArea(e.target as Node)) return;
      
      // Right click or middle mouse button for panning
      if (e.button === 2 || e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        updateCursor('grabbing');
        return;
      }
      
      // Left click on canvas background for panning
      if (e.button === 0 && isInCanvasArea(e.target as Node)) {
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          updateCursor('grabbing');
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        e.stopPropagation();
        
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(false);
        updateCursor(zoom > 1 ? 'grab' : 'default');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isInCanvasArea(e.target as Node)) {
        e.preventDefault(); // Prevent context menu on right click
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [
    isInCanvasArea,
    isPanning,
    setIsPanning,
    setPanStart,
    panStart,
    setPanOffset,
    updateCursor,
    zoom,
    handleWheel,
    canvasViewportRef,
  ]);
};
