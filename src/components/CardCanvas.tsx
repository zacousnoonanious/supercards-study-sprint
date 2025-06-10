
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dragElementStart, setDragElementStart] = useState({ x: 0, y: 0 });
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    // Don't start dragging if we're editing this element
    if (editingElement === elementId) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    onSelectElement(elementId);
    setIsDragging(true);
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
    if (!isDragging || !dragElementId) return;
    
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
  }, [isDragging, dragElementId, dragStart, dragElementStart, elements, style, snapToGrid, gridSize, zoom, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragElementId(null);
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
      
      {/* Draggable resize handle for canvas size */}
      {onCanvasSizeChange && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-20"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = style?.width as number || 600;
            const startHeight = style?.height as number || 450;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;
              
              const newWidth = Math.max(200, Math.min(2000, startWidth + deltaX / zoom));
              const newHeight = Math.max(200, Math.min(2000, startHeight + deltaY / zoom));
              
              onCanvasSizeChange(Math.round(newWidth), Math.round(newHeight));
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
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
          
          {selectedElement === element.id && editingElement !== element.id && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
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
