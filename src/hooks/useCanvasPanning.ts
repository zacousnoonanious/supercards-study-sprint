
import { useCallback } from 'react';

interface UseCanvasPanningProps {
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  canvasViewportRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

export const useCanvasPanning = ({
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  panOffset,
  setPanOffset,
  canvasViewportRef,
  zoom,
}: UseCanvasPanningProps) => {
  const startPan = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [setIsPanning, setPanStart]);

  const panCanvas = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart, setPanOffset, setPanStart]);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, [setIsPanning]);

  const updateCursor = useCallback((cursor: string) => {
    const container = canvasViewportRef.current || document.querySelector('.flex-1.flex.items-center.justify-center') as HTMLElement;
    if (container) {
      container.style.cursor = cursor;
    }
  }, [canvasViewportRef]);

  return {
    startPan,
    panCanvas,
    endPan,
    updateCursor,
  };
};
