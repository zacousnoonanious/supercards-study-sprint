
import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasBackground } from './CanvasBackground';
import { CanvasElementWrapper } from './canvas/CanvasElementWrapper';
import { CanvasEmptyState } from './canvas/CanvasEmptyState';
import { CanvasCardSideIndicator } from './canvas/CanvasCardSideIndicator';
import { useCanvasDragResize } from '@/hooks/useCanvasDragResize';
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
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Get canvas dimensions from style
  const canvasWidth = (style?.width as number) || 600;
  const canvasHeight = (style?.height as number) || 450;

  const {
    isDragging,
    isResizing,
    dragElementId,
    handleMouseMove,
    startDragOrResize,
    endDragOrResize,
    updateDragStart,
  } = useCanvasDragResize({
    elements,
    onUpdateElement,
    canvasWidth,
    canvasHeight,
    snapToGrid,
    gridSize,
  });

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize' = 'drag', handle?: string) => {
    // Don't start dragging if we're editing this element
    if (editingElement === elementId && action === 'drag') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    onSelectElement(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Get mouse position relative to canvas
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      updateDragStart(canvasX, canvasY);
      startDragOrResize(e, elementId, action, handle);
    }
  }, [onSelectElement, editingElement, updateDragStart, startDragOrResize]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMouseMove(e, rect);
    }
  }, [handleMouseMove]);

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
      style={{
        ...style,
        width: canvasWidth,
        height: canvasHeight,
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={endDragOrResize}
      onMouseLeave={endDragOrResize}
      data-canvas-background="true"
    >
      <CanvasBackground 
        showGrid={showGrid} 
        gridSize={gridSize}
        isDarkTheme={isDarkTheme}
      />
      
      <CanvasCardSideIndicator
        cardSide={cardSide}
        isDarkTheme={isDarkTheme}
      />
      
      {elements.map((element) => (
        <CanvasElementWrapper
          key={element.id}
          element={element}
          isSelected={selectedElement === element.id}
          isDragging={isDragging && dragElementId === element.id}
          editingElement={editingElement}
          zoom={zoom}
          onMouseDown={handleElementMouseDown}
          onClick={handleElementClick}
          onUpdateElement={onUpdateElement}
          onEditingChange={handleEditingChange}
        />
      ))}
      
      {elements.length === 0 && <CanvasEmptyState />}
    </div>
  );
};
