
import { useEffect, useCallback } from 'react';

interface UseCanvasInteractionProps {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  canvasViewportRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;
  cardWidth: number;
  cardHeight: number;
}

export const useCanvasInteraction = ({
  canvasContainerRef,
  canvasViewportRef,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  cardWidth,
  cardHeight,
}: UseCanvasInteractionProps) => {
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

  const fitToView = useCallback(() => {
    // Try to find the main canvas area first (CardEditorLayout)
    let canvasArea = document.querySelector('.flex-1.flex.items-center.justify-center');
    
    // If not found, check if we're in fullscreen mode
    if (!canvasArea && canvasViewportRef.current) {
      canvasArea = canvasViewportRef.current;
    }
    
    if (!canvasArea) return;
    
    const canvasAreaRect = canvasArea.getBoundingClientRect();
    
    // Different padding based on context
    const isFullscreen = canvasArea === canvasViewportRef.current;
    const padding = isFullscreen ? 80 : 32; // More padding in fullscreen
    const availableWidth = canvasAreaRect.width - padding;
    const availableHeight = canvasAreaRect.height - padding;
    
    // Calculate zoom to fit canvas with padding
    const extraPadding = isFullscreen ? 0 : 40;
    const zoomX = (availableWidth - extraPadding) / cardWidth;
    const zoomY = (availableHeight - extraPadding) / cardHeight;
    const maxZoom = isFullscreen ? 2 : 1; // Allow higher zoom in fullscreen
    const newZoom = Math.min(zoomX, zoomY, maxZoom);
    
    setZoom(newZoom);
    
    if (isFullscreen) {
      // In fullscreen, we need to manually center
      const scaledWidth = cardWidth * newZoom;
      const scaledHeight = cardHeight * newZoom;
      const centerX = (canvasAreaRect.width - scaledWidth) / 2;
      const centerY = (canvasAreaRect.height - scaledHeight) / 2;
      setPanOffset({ x: centerX, y: centerY });
    } else {
      // In normal mode, CSS centers it
      setPanOffset({ x: 0, y: 0 });
    }
  }, [cardWidth, cardHeight, setZoom, setPanOffset, canvasViewportRef]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasViewportRef.current?.contains(e.target as Node)) return;
    
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
  }, [zoom, setZoom, setPanOffset, canvasViewportRef]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!canvasViewportRef.current?.contains(e.target as Node)) return;
      
      // Right click or middle mouse button for panning
      if (e.button === 2 || e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = 'grabbing';
        }
        return;
      }
      
      // Left click on canvas background for panning
      if (e.button === 0 && canvasViewportRef.current?.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          
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
      if (isPanning) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(false);
        
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (canvasViewportRef.current?.contains(e.target as Node)) {
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
  }, [zoom, panOffset, isPanning, panStart, canvasViewportRef, setZoom, setPanOffset, setIsPanning, setPanStart, handleWheel]);

  return {
    startPan,
    panCanvas,
    endPan,
    handleWheel,
    fitToView,
  };
};
