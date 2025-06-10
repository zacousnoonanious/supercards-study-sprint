
import { useCallback } from 'react';

interface UseCanvasFitToViewProps {
  canvasViewportRef: React.RefObject<HTMLDivElement>;
  cardWidth: number;
  cardHeight: number;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
}

export const useCanvasFitToView = ({
  canvasViewportRef,
  cardWidth,
  cardHeight,
  setZoom,
  setPanOffset,
}: UseCanvasFitToViewProps) => {
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
    
    if (isFullscreen) {
      // Fullscreen mode - more generous padding
      const padding = 80;
      const availableWidth = canvasAreaRect.width - padding;
      const availableHeight = canvasAreaRect.height - padding;
      
      const zoomX = availableWidth / cardWidth;
      const zoomY = availableHeight / cardHeight;
      const newZoom = Math.min(zoomX, zoomY, 2); // Allow up to 200% zoom in fullscreen
      
      setZoom(newZoom);
      
      // Center the canvas in the viewport
      const scaledWidth = cardWidth * newZoom;
      const scaledHeight = cardHeight * newZoom;
      const centerX = (canvasAreaRect.width - scaledWidth) / 2;
      const centerY = (canvasAreaRect.height - scaledHeight) / 2;
      setPanOffset({ x: centerX, y: centerY });
    } else {
      // Normal mode - make the canvas fill more of the available space
      const padding = 40; // Reduced padding for normal mode
      const availableWidth = canvasAreaRect.width - padding;
      const availableHeight = canvasAreaRect.height - padding;
      
      // Calculate zoom to make canvas fill available space better
      const zoomX = availableWidth / cardWidth;
      const zoomY = availableHeight / cardHeight;
      const newZoom = Math.min(zoomX, zoomY, 1.5); // Allow up to 150% zoom in normal mode
      
      setZoom(newZoom);
      
      // Reset pan offset since CSS handles centering in normal mode
      setPanOffset({ x: 0, y: 0 });
    }
  }, [cardWidth, cardHeight, setZoom, setPanOffset, canvasViewportRef]);

  return {
    fitToView,
  };
};
