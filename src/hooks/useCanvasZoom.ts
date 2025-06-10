
import { useCallback } from 'react';

interface UseCanvasZoomProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  canvasViewportRef: React.RefObject<HTMLDivElement>;
}

export const useCanvasZoom = ({
  zoom,
  setZoom,
  setPanOffset,
  canvasViewportRef,
}: UseCanvasZoomProps) => {
  const isInCanvasArea = useCallback((target: Node) => {
    // Check if we're in fullscreen mode
    if (canvasViewportRef.current?.contains(target)) {
      return true;
    }
    
    // Check if we're in normal mode canvas area
    const normalCanvasArea = document.querySelector('.flex-1.flex.items-center.justify-center');
    if (normalCanvasArea?.contains(target)) {
      return true;
    }
    
    return false;
  }, [canvasViewportRef]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isInCanvasArea(e.target as Node)) return;
    
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));
      setZoom(newZoom);
    } else {
      setPanOffset(prev => ({
        x: prev.x - e.deltaX * 0.5,
        y: prev.y - e.deltaY * 0.5
      }));
    }
  }, [zoom, setZoom, setPanOffset, isInCanvasArea]);

  return {
    handleWheel,
    isInCanvasArea,
  };
};
