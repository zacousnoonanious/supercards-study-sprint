
import { useState, useCallback, useRef } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface UseCanvasDragResizeProps {
  elements: CanvasElement[];
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  canvasWidth: number;
  canvasHeight: number;
  snapToGrid: boolean;
  gridSize: number;
  zoom?: number;
}

export const useCanvasDragResize = ({
  elements,
  onUpdateElement,
  canvasWidth,
  canvasHeight,
  snapToGrid,
  gridSize,
  zoom = 1,
}: UseCanvasDragResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  
  // Use refs for smooth updates
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const snapToGridIfEnabled = useCallback((value: number) => {
    if (snapToGrid && gridSize > 0) {
      return Math.round(value / gridSize) * gridSize;
    }
    return Math.round(value);
  }, [snapToGrid, gridSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRect: DOMRect) => {
    if ((!isDraggingRef.current && !isResizingRef.current) || !dragElementId) return;
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const element = elements.find(el => el.id === dragElementId);
      if (!element) return;
      
      // Calculate current mouse position relative to canvas
      const currentX = (e.clientX - canvasRect.left) / zoom;
      const currentY = (e.clientY - canvasRect.top) / zoom;
      
      // Calculate the delta from drag start
      const deltaX = currentX - dragStart.x / zoom;
      const deltaY = currentY - dragStart.y / zoom;
      
      if (isDraggingRef.current) {
        // Simple dragging - just move the element
        let newX = dragElementStart.x + deltaX;
        let newY = dragElementStart.y + deltaY;
        
        // Constrain to canvas bounds first
        newX = Math.max(0, Math.min(newX, canvasWidth - element.width));
        newY = Math.max(0, Math.min(newY, canvasHeight - element.height));
        
        // Apply grid snapping after constraint
        if (snapToGrid) {
          newX = snapToGridIfEnabled(newX);
          newY = snapToGridIfEnabled(newY);
        }
        
        onUpdateElement(dragElementId, { x: newX, y: newY });
      } else if (isResizingRef.current) {
        // Handle resizing based on the handle
        let newWidth = dragElementStart.width;
        let newHeight = dragElementStart.height;
        let newX = dragElementStart.x;
        let newY = dragElementStart.y;
        
        const minSize = 20;
        
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
        
        // Constrain to canvas bounds
        newX = Math.max(0, Math.min(newX, canvasWidth - minSize));
        newY = Math.max(0, Math.min(newY, canvasHeight - minSize));
        newWidth = Math.max(minSize, Math.min(newWidth, canvasWidth - newX));
        newHeight = Math.max(minSize, Math.min(newHeight, canvasHeight - newY));
        
        // Apply grid snapping if enabled for resizing
        if (snapToGrid) {
          newWidth = snapToGridIfEnabled(newWidth);
          newHeight = snapToGridIfEnabled(newHeight);
          newX = snapToGridIfEnabled(newX);
          newY = snapToGridIfEnabled(newY);
        }
        
        onUpdateElement(dragElementId, { 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight 
        });
      }
    });
  }, [dragElementId, dragStart, dragElementStart, elements, canvasWidth, canvasHeight, snapToGridIfEnabled, onUpdateElement, resizeHandle, zoom, snapToGrid]);

  const startDragOrResize = useCallback((
    e: React.MouseEvent,
    elementId: string,
    action: 'drag' | 'resize' = 'drag',
    handle?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (action === 'resize') {
      setIsResizing(true);
      isResizingRef.current = true;
      setResizeHandle(handle || '');
    } else {
      setIsDragging(true);
      isDraggingRef.current = true;
    }
    
    setDragElementId(elementId);
    
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
    isDraggingRef.current = false;
    isResizingRef.current = false;
    setDragElementId(null);
    setResizeHandle('');
    setDragElementStart({ x: 0, y: 0, width: 0, height: 0 });
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
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
