
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
  calculateSnapPosition?: (element: CanvasElement, x: number, y: number) => { x: number; y: number };
}

export const useCanvasDragResize = ({
  elements,
  onUpdateElement,
  canvasWidth,
  canvasHeight,
  snapToGrid,
  gridSize,
  zoom = 1,
  calculateSnapPosition,
}: UseCanvasDragResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  
  // Use refs to store client positions to avoid triggering re-renders during drag
  const clientPositionsRef = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());
  const [clientPositionsVersion, setClientPositionsVersion] = useState(0);
  
  // Use refs for immediate state access in event handlers
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  
  // CRITICAL: Prevent multiple database updates by tracking if update is pending
  const updatePendingRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);

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
    
    // Use requestAnimationFrame for smooth updates - but limit frequency
    animationFrameRef.current = requestAnimationFrame(() => {
      const element = elements.find(el => el.id === dragElementId);
      if (!element) return;
      
      // Calculate current mouse position relative to canvas, accounting for zoom
      const currentX = (e.clientX - canvasRect.left) / zoom;
      const currentY = (e.clientY - canvasRect.top) / zoom;
      
      // Calculate the delta from drag start
      const deltaX = currentX - dragStart.x / zoom;
      const deltaY = currentY - dragStart.y / zoom;
      
      if (isDraggingRef.current) {
        // Calculate new position
        let newX = dragElementStart.x + deltaX;
        let newY = dragElementStart.y + deltaY;
        
        // Constrain to canvas bounds
        newX = Math.max(0, Math.min(newX, canvasWidth - element.width));
        newY = Math.max(0, Math.min(newY, canvasHeight - element.height));
        
        // Apply smart snapping if available (for magnetic behavior during drag)
        if (calculateSnapPosition) {
          const snapped = calculateSnapPosition(element, newX, newY);
          newX = snapped.x;
          newY = snapped.y;
        } else if (snapToGrid) {
          // Apply grid snapping during drag for visual feedback
          newX = snapToGridIfEnabled(newX);
          newY = snapToGridIfEnabled(newY);
        }
        
        // Update client-side position using ref to avoid re-renders
        clientPositionsRef.current.set(dragElementId, {
          x: newX,
          y: newY,
          width: element.width,
          height: element.height
        });
        
        // CRITICAL: Only trigger re-render every 16ms (60fps) to prevent excessive updates
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 16) {
          setClientPositionsVersion(prev => prev + 1);
          lastUpdateTimeRef.current = now;
        }
        
      } else if (isResizingRef.current) {
        // Handle resizing with the same throttling approach
        let newWidth = dragElementStart.width;
        let newHeight = dragElementStart.height;
        let newX = dragElementStart.x;
        let newY = dragElementStart.y;
        
        const minSize = 20;
        
        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(minSize, dragElementStart.width + deltaX);
            newHeight = Math.max(minSize, dragElementStart.height + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(minSize, dragElementStart.width - deltaX);
            newHeight = Math.max(minSize, dragElementStart.height + deltaY);
            newX = dragElementStart.x + (dragElementStart.width - newWidth);
            break;
          case 'ne':
            newWidth = Math.max(minSize, dragElementStart.width + deltaX);
            newHeight = Math.max(minSize, dragElementStart.height - deltaY);
            newY = dragElementStart.y + (dragElementStart.height - newHeight);
            break;
          case 'nw':
            newWidth = Math.max(minSize, dragElementStart.width - deltaX);
            newHeight = Math.max(minSize, dragElementStart.height - deltaY);
            newX = dragElementStart.x + (dragElementStart.width - newWidth);
            newY = dragElementStart.y + (dragElementStart.height - newHeight);
            break;
          case 'n':
            newHeight = Math.max(minSize, dragElementStart.height - deltaY);
            newY = dragElementStart.y + (dragElementStart.height - newHeight);
            break;
          case 's':
            newHeight = Math.max(minSize, dragElementStart.height + deltaY);
            break;
          case 'e':
            newWidth = Math.max(minSize, dragElementStart.width + deltaX);
            break;
          case 'w':
            newWidth = Math.max(minSize, dragElementStart.width - deltaX);
            newX = dragElementStart.x + (dragElementStart.width - newWidth);
            break;
        }
        
        // Constrain to canvas bounds
        newX = Math.max(0, Math.min(newX, canvasWidth - minSize));
        newY = Math.max(0, Math.min(newY, canvasHeight - minSize));
        newWidth = Math.max(minSize, Math.min(newWidth, canvasWidth - newX));
        newHeight = Math.max(minSize, Math.min(newHeight, canvasHeight - newY));
        
        // Apply grid snapping if enabled
        const snappedWidth = snapToGrid ? snapToGridIfEnabled(newWidth) : newWidth;
        const snappedHeight = snapToGrid ? snapToGridIfEnabled(newHeight) : newHeight;
        const snappedX = snapToGrid ? snapToGridIfEnabled(newX) : newX;
        const snappedY = snapToGrid ? snapToGridIfEnabled(newY) : newY;
        
        // Update client-side position using ref to avoid re-renders
        clientPositionsRef.current.set(dragElementId, {
          x: snappedX,
          y: snappedY,
          width: snappedWidth,
          height: snappedHeight
        });
        
        // CRITICAL: Only trigger re-render every 16ms (60fps) to prevent excessive updates
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 16) {
          setClientPositionsVersion(prev => prev + 1);
          lastUpdateTimeRef.current = now;
        }
      }
    });
  }, [dragElementId, dragStart, dragElementStart, elements, canvasWidth, canvasHeight, snapToGridIfEnabled, resizeHandle, zoom, snapToGrid, calculateSnapPosition]);

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
    
    // Initialize client-side position with current element position
    clientPositionsRef.current.set(elementId, {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    });
    
    // Reset update tracking
    updatePendingRef.current = false;
    lastUpdateTimeRef.current = Date.now();
  }, [elements]);

  const endDragOrResize = useCallback(() => {
    if (dragElementId && !updatePendingRef.current) {
      const finalPosition = clientPositionsRef.current.get(dragElementId);
      if (finalPosition) {
        console.log('🔧 DRAG END: Single database update for element:', dragElementId, finalPosition);
        
        // Mark update as pending to prevent duplicate calls
        updatePendingRef.current = true;
        
        // Send final position to database - this is the ONLY database update during the entire drag operation
        onUpdateElement(dragElementId, finalPosition);
        
        // Clear client position after a delay to prevent flickering
        setTimeout(() => {
          clientPositionsRef.current.delete(dragElementId);
          setClientPositionsVersion(prev => prev + 1);
          updatePendingRef.current = false;
        }, 100);
      }
    }
    
    // Reset drag state immediately
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
  }, [dragElementId, onUpdateElement]);

  const updateDragStart = useCallback((x: number, y: number) => {
    setDragStart({ x, y });
  }, []);

  // Get the current position of an element (client-side override during drag, or original position)
  const getElementPosition = useCallback((elementId: string) => {
    return clientPositionsRef.current.get(elementId);
  }, [clientPositionsVersion]); // Include version to trigger updates

  // Clear client position for an element (called by parent after successful database update)
  const clearClientPosition = useCallback((elementId: string) => {
    clientPositionsRef.current.delete(elementId);
    setClientPositionsVersion(prev => prev + 1);
  }, []);

  return {
    isDragging,
    isResizing,
    dragElementId,
    handleMouseMove,
    startDragOrResize,
    endDragOrResize,
    updateDragStart,
    getElementPosition,
    clearClientPosition,
  };
};
