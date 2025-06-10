
import { useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface UseCanvasDragResizeProps {
  elements: CanvasElement[];
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  canvasStyle?: React.CSSProperties;
  snapToGrid: boolean;
  gridSize: number;
}

export const useCanvasDragResize = ({
  elements,
  onUpdateElement,
  canvasStyle,
  snapToGrid,
  gridSize,
}: UseCanvasDragResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');

  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRect: DOMRect) => {
    if ((!isDragging && !isResizing) || !dragElementId) return;
    
    const element = elements.find(el => el.id === dragElementId);
    if (!element) return;
    
    // Calculate current mouse position relative to canvas
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;
    
    // Calculate the actual pixel delta
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    if (isDragging) {
      // Simple dragging - just move the element
      let newX = dragElementStart.x + deltaX;
      let newY = dragElementStart.y + deltaY;
      
      // Apply grid snapping if enabled
      if (snapToGrid && gridSize > 0) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Constrain to canvas bounds
      const canvasWidth = canvasStyle?.width as number || 600;
      const canvasHeight = canvasStyle?.height as number || 450;
      newX = Math.max(0, Math.min(newX, canvasWidth - element.width));
      newY = Math.max(0, Math.min(newY, canvasHeight - element.height));
      
      onUpdateElement(dragElementId, { x: newX, y: newY });
    } else if (isResizing) {
      // Handle resizing based on the handle
      let newWidth = dragElementStart.width;
      let newHeight = dragElementStart.height;
      let newX = dragElementStart.x;
      let newY = dragElementStart.y;
      
      const minSize = 20;
      const canvasWidth = canvasStyle?.width as number || 600;
      const canvasHeight = canvasStyle?.height as number || 450;
      
      switch (resizeHandle) {
        case 'se': // Southeast - bottom right
          newWidth = Math.max(minSize, dragElementStart.width + deltaX);
          newHeight = Math.max(minSize, dragElementStart.height + deltaY);
          break;
        case 'sw': // Southwest - bottom left
          newWidth = Math.max(minSize, dragElementStart.width - deltaX);
          newHeight = Math.max(minSize, dragElementStart.height + deltaY);
          newX = dragElementStart.x + (dragElementStart.width - newWidth);
          break;
        case 'ne': // Northeast - top right
          newWidth = Math.max(minSize, dragElementStart.width + deltaX);
          newHeight = Math.max(minSize, dragElementStart.height - deltaY);
          newY = dragElementStart.y + (dragElementStart.height - newHeight);
          break;
        case 'nw': // Northwest - top left
          newWidth = Math.max(minSize, dragElementStart.width - deltaX);
          newHeight = Math.max(minSize, dragElementStart.height - deltaY);
          newX = dragElementStart.x + (dragElementStart.width - newWidth);
          newY = dragElementStart.y + (dragElementStart.height - newHeight);
          break;
        case 'n': // North - top
          newHeight = Math.max(minSize, dragElementStart.height - deltaY);
          newY = dragElementStart.y + (dragElementStart.height - newHeight);
          break;
        case 's': // South - bottom
          newHeight = Math.max(minSize, dragElementStart.height + deltaY);
          break;
        case 'e': // East - right
          newWidth = Math.max(minSize, dragElementStart.width + deltaX);
          break;
        case 'w': // West - left
          newWidth = Math.max(minSize, dragElementStart.width - deltaX);
          newX = dragElementStart.x + (dragElementStart.width - newWidth);
          break;
      }
      
      // Apply grid snapping if enabled
      if (snapToGrid && gridSize > 0) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Constrain to canvas bounds
      newX = Math.max(0, Math.min(newX, canvasWidth - newWidth));
      newY = Math.max(0, Math.min(newY, canvasHeight - newHeight));
      newWidth = Math.min(newWidth, canvasWidth - newX);
      newHeight = Math.min(newHeight, canvasHeight - newY);
      
      onUpdateElement(dragElementId, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [isDragging, isResizing, dragElementId, dragStart, dragElementStart, elements, canvasStyle, snapToGrid, gridSize, onUpdateElement, resizeHandle]);

  const startDragOrResize = useCallback((
    e: React.MouseEvent,
    elementId: string,
    action: 'drag' | 'resize' = 'drag',
    handle?: string
  ) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || '');
    } else {
      setIsDragging(true);
    }
    
    setDragElementId(elementId);
    
    // Store mouse start position (will be calculated relative to canvas in the component)
    setDragStart({ x: 0, y: 0 }); // Will be set by the component
    
    // Store the initial element state
    setDragElementStart({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
  }, [elements]);

  const endDragOrResize = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragElementId(null);
    setResizeHandle('');
    setDragElementStart({ x: 0, y: 0, width: 0, height: 0 });
  }, []);

  const updateDragStart = useCallback((x: number, y: number) => {
    setDragStart({ x, y });
  }, []);

  return {
    isDragging,
    isResizing,
    dragElementId,
    handleMouseMove,
    startDragOrResize,
    endDragOrResize,
    updateDragStart,
  };
};
