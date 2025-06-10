
import { useEffect, useCallback } from 'react';

interface UseCanvasInteractionProps {
  canvasViewportRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;
  isTextSelecting: boolean;
}

export const useCanvasInteraction = ({
  canvasViewportRef,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  isTextSelecting,
}: UseCanvasInteractionProps) => {
  // Handle zoom and pan with left-click dragging - only for canvas background
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!canvasViewportRef.current?.contains(e.target as Node)) return;
      
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl+scroll or pinch
        const rect = canvasViewportRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));
        
        // Adjust pan to zoom towards center
        const zoomRatio = newZoom / zoom;
        setPanOffset(prev => ({
          x: centerX - (centerX - prev.x) * zoomRatio,
          y: centerY - (centerY - prev.y) * zoomRatio
        }));
        
        setZoom(newZoom);
      } else {
        // Pan with scroll
        setPanOffset(prev => ({
          x: prev.x - e.deltaX * 0.5,
          y: prev.y - e.deltaY * 0.5
        }));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't handle panning during text selection
      if (isTextSelecting) return;

      // Only handle left mouse button and only within canvas viewport
      if (e.button === 0 && canvasViewportRef.current?.contains(e.target as Node)) {
        // Check if we clicked on the canvas background, not an element
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          
          // Add cursor style
          if (canvasViewportRef.current) {
            canvasViewportRef.current.style.cursor = 'grabbing';
          }
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
      if (e.button === 0 && isPanning) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(false);
        
        // Reset cursor style
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (!canvasViewportRef.current?.contains(e.target as Node)) return;
      
      if (e.touches.length === 1) {
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          setIsPanning(true);
          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - panStart.x;
        const deltaY = e.touches[0].clientY - panStart.y;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    const handleTouchEnd = () => {
      if (isPanning) {
        setIsPanning(false);
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, panOffset, isPanning, panStart, isTextSelecting, canvasViewportRef, setZoom, setPanOffset, setIsPanning, setPanStart]);
};
