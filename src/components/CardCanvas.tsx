
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
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
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
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || '');
    } else {
      setIsDragging(true);
    }
    
    setDragElementId(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Get mouse position relative to canvas (without zoom adjustment for now)
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      setDragStart({ x: canvasX, y: canvasY });
      
      // Store the initial element state
      setDragElementStart({
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      });
    }
  }, [onSelectElement, elements, editingElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if ((!isDragging && !isResizing) || !dragElementId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const element = elements.find(el => el.id === dragElementId);
    if (!element) return;
    
    // Calculate current mouse position relative to canvas
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
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
      const canvasWidth = style?.width as number || 600;
      const canvasHeight = style?.height as number || 450;
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
      const canvasWidth = style?.width as number || 600;
      const canvasHeight = style?.height as number || 450;
      
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
  }, [isDragging, isResizing, dragElementId, dragStart, dragElementStart, elements, style, snapToGrid, gridSize, onUpdateElement, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragElementId(null);
    setResizeHandle('');
    setDragElementStart({ x: 0, y: 0, width: 0, height: 0 });
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
      onMouseLeave={handleMouseUp}
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
