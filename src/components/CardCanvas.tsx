
import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { CanvasBackground } from './CanvasBackground';
import { useTheme } from '@/contexts/ThemeContext';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement?: string | null;
  onSelectElement: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  cardSide: 'front' | 'back';
  style?: React.CSSProperties;
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  showBorder?: boolean;
  zoom?: number;
  onCanvasSizeChange?: (width: number, height: number) => void;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
  style,
  showGrid = false,
  gridSize = 20,
  snapToGrid = false,
  showBorder = false,
  zoom = 1,
  onCanvasSizeChange,
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isCanvasResizing, setIsCanvasResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize' = 'drag', handle?: string) => {
    // Don't start dragging if we're editing this element
    if (editingElement === elementId && action === 'drag') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    onSelectElement(elementId);
    
    if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || '');
    } else {
      setIsDragging(true);
    }
    
    setDragElementId(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Store the initial mouse position
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
      
      // Store the initial element position
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setDragElementStart({
          x: element.x,
          y: element.y,
        });
      }
    }
  }, [onSelectElement, elements, editingElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !dragElementId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate the raw mouse movement
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Adjust for zoom - divide by zoom to get actual canvas movement
    const adjustedDeltaX = deltaX / zoom;
    const adjustedDeltaY = deltaY / zoom;
    
    const element = elements.find(el => el.id === dragElementId);
    if (!element) return;
    
    if (isDragging) {
      // Calculate new position based on initial element position + adjusted delta
      let newX = dragElementStart.x + adjustedDeltaX;
      let newY = dragElementStart.y + adjustedDeltaY;
      
      // Apply grid snapping if enabled
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Constrain to canvas bounds
      const canvasWidth = style?.width as number || 600;
      const canvasHeight = style?.height as number || 450;
      newX = Math.max(0, Math.min(newX, canvasWidth - element.width));
      newY = Math.max(0, Math.min(newY, canvasHeight - element.height));
      
      onUpdateElement(dragElementId, { x: newX, y: newY });
    } else if (isResizing) {
      // Handle resizing based on the resize handle
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      const minSize = 20;
      const canvasWidth = style?.width as number || 600;
      const canvasHeight = style?.height as number || 450;
      
      switch (resizeHandle) {
        case 'se': // Southeast - bottom right
          newWidth = Math.max(minSize, Math.min(element.width + adjustedDeltaX, canvasWidth - element.x));
          newHeight = Math.max(minSize, Math.min(element.height + adjustedDeltaY, canvasHeight - element.y));
          break;
        case 'sw': // Southwest - bottom left
          newWidth = Math.max(minSize, element.width - adjustedDeltaX);
          newHeight = Math.max(minSize, Math.min(element.height + adjustedDeltaY, canvasHeight - element.y));
          newX = element.x + (element.width - newWidth);
          break;
        case 'ne': // Northeast - top right
          newWidth = Math.max(minSize, Math.min(element.width + adjustedDeltaX, canvasWidth - element.x));
          newHeight = Math.max(minSize, element.height - adjustedDeltaY);
          newY = element.y + (element.height - newHeight);
          break;
        case 'nw': // Northwest - top left
          newWidth = Math.max(minSize, element.width - adjustedDeltaX);
          newHeight = Math.max(minSize, element.height - adjustedDeltaY);
          newX = element.x + (element.width - newWidth);
          newY = element.y + (element.height - newHeight);
          break;
        case 'n': // North - top
          newHeight = Math.max(minSize, element.height - adjustedDeltaY);
          newY = element.y + (element.height - newHeight);
          break;
        case 's': // South - bottom
          newHeight = Math.max(minSize, Math.min(element.height + adjustedDeltaY, canvasHeight - element.y));
          break;
        case 'e': // East - right
          newWidth = Math.max(minSize, Math.min(element.width + adjustedDeltaX, canvasWidth - element.x));
          break;
        case 'w': // West - left
          newWidth = Math.max(minSize, element.width - adjustedDeltaX);
          newX = element.x + (element.width - newWidth);
          break;
      }
      
      // Apply grid snapping if enabled
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Ensure element stays within canvas bounds
      newX = Math.max(0, Math.min(newX, canvasWidth - newWidth));
      newY = Math.max(0, Math.min(newY, canvasHeight - newHeight));
      
      onUpdateElement(dragElementId, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [isDragging, isResizing, dragElementId, dragStart, dragElementStart, elements, style, snapToGrid, gridSize, zoom, onUpdateElement, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragElementId(null);
    setResizeHandle('');
    setDragElementStart({ x: 0, y: 0 });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Check if the click target is the canvas itself or the background
    const isCanvasBackground = e.target === canvasRef.current || 
                               (e.target as Element).hasAttribute('data-canvas-background') ||
                               (e.target as Element).closest('[data-canvas-background]') === canvasRef.current;
    
    if (isCanvasBackground) {
      onSelectElement(null);
      setEditingElement(null);
    }
  }, [onSelectElement]);

  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    onSelectElement(elementId);
  }, [onSelectElement]);

  const handleEditingChange = useCallback((elementId: string | null) => {
    setEditingElement(elementId);
  }, []);

  // Canvas resize functionality
  const handleCanvasResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCanvasResize = useCallback((e: React.MouseEvent) => {
    if (!isCanvasResizing || !onCanvasSizeChange) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const currentWidth = style?.width as number || 600;
    const currentHeight = style?.height as number || 450;
    
    const newWidth = Math.max(200, Math.min(2000, currentWidth + deltaX / zoom));
    const newHeight = Math.max(200, Math.min(2000, currentHeight + deltaY / zoom));
    
    onCanvasSizeChange(Math.round(newWidth), Math.round(newHeight));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isCanvasResizing, dragStart, style, zoom, onCanvasSizeChange]);

  const handleCanvasResizeEnd = useCallback(() => {
    setIsCanvasResizing(false);
  }, []);

  // Global mouse events for canvas resizing
  React.useEffect(() => {
    if (isCanvasResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleCanvasResize({
          clientX: e.clientX,
          clientY: e.clientY,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent);
      };

      const handleGlobalMouseUp = () => {
        handleCanvasResizeEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isCanvasResizing, handleCanvasResize, handleCanvasResizeEnd]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-white'} ${
        showBorder ? 'border-2 border-dashed border-gray-400' : ''
      }`}
      style={style}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      data-canvas-background="true"
    >
      <CanvasBackground 
        showGrid={showGrid} 
        gridSize={gridSize}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Card side indicator */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
        }`}>
          {cardSide === 'front' ? 'Front' : 'Back'}
        </div>
      </div>
      
      {/* Canvas resize handle */}
      {onCanvasSizeChange && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-20"
          onMouseDown={handleCanvasResizeStart}
        />
      )}
      
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute select-none ${
            selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            transformOrigin: 'center',
            zIndex: element.zIndex || 0,
            cursor: isDragging && dragElementId === element.id ? 'grabbing' : 
                   editingElement === element.id ? 'text' : 'grab',
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          onClick={(e) => handleElementClick(e, element.id)}
          data-element="true"
        >
          <CanvasElementRenderer
            element={element}
            editingElement={editingElement}
            onUpdateElement={onUpdateElement}
            onEditingChange={handleEditingChange}
            zoom={zoom}
            onElementDragStart={(e, elementId) => handleElementMouseDown(e, elementId)}
            isDragging={isDragging && dragElementId === element.id}
            isSelected={selectedElement === element.id}
          />
          
          {/* Resize handles for selected element */}
          {selectedElement === element.id && editingElement !== element.id && (
            <>
              {/* Corner handles */}
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'nw');
                }}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'ne');
                }}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'sw');
                }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'se');
                }}
              />
              
              {/* Edge handles */}
              <div
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'n');
                }}
              />
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 's');
                }}
              />
              <div
                className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-w-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'w');
                }}
              />
              <div
                className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize border border-white"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleElementMouseDown(e, element.id, 'resize', 'e');
                }}
              />
            </>
          )}
        </div>
      ))}
      
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
          <div className="text-center">
            <p>No elements yet</p>
            <p className="text-sm mt-2">Use the toolbar to add elements</p>
          </div>
        </div>
      )}
    </div>
  );
};
