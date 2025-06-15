
import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasBackground } from './CanvasBackground';
import { EnhancedCanvasElementWrapper } from './canvas/EnhancedCanvasElementWrapper';
import { CanvasEmptyState } from './canvas/CanvasEmptyState';
import { CanvasCardSideIndicator } from './canvas/CanvasCardSideIndicator';
import { SmartSnapGuides } from './canvas/SmartSnapGuides';
import { useCanvasDragResize } from '@/hooks/useCanvasDragResize';
import { useSmartSnapping } from '@/hooks/useSmartSnapping';
import { useLayoutConstraints } from '@/hooks/useLayoutConstraints';
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
  onDuplicateElement?: (element: CanvasElement) => void;
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
  onDuplicateElement,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Get canvas dimensions from style
  const canvasWidth = (style?.width as number) || 600;
  const canvasHeight = (style?.height as number) || 450;

  const {
    calculateSnapPosition,
    clearSnapGuides,
    activeSnapGuides,
  } = useSmartSnapping({
    elements,
    canvasWidth,
    canvasHeight,
    snapThreshold: 5,
  });

  const {
    applyConstraintsToAll,
    addConstraintToElement,
    removeConstraintFromElement,
  } = useLayoutConstraints({
    elements,
    canvasWidth,
    canvasHeight,
    originalCanvasWidth: canvasWidth,
    originalCanvasHeight: canvasHeight,
    onUpdateElement,
  });

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
    onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => {
      // Apply smart snapping during drag
      if (isDragging && updates.x !== undefined && updates.y !== undefined) {
        const element = elements.find(el => el.id === elementId);
        if (element) {
          const snapped = calculateSnapPosition(element, updates.x, updates.y);
          updates.x = snapped.x;
          updates.y = snapped.y;
        }
      }
      onUpdateElement(elementId, updates);
    },
    canvasWidth,
    canvasHeight,
    snapToGrid,
    gridSize,
    zoom,
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

  const handleMouseUpOrLeave = useCallback(() => {
    endDragOrResize();
    clearSnapGuides();
  }, [endDragOrResize, clearSnapGuides]);

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

  const handleDuplicateElement = useCallback((element: CanvasElement) => {
    if (onDuplicateElement) {
      onDuplicateElement(element);
    } else {
      // Default duplication logic
      const newElement: CanvasElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: (element.zIndex || 0) + 1,
      };
      onUpdateElement(newElement.id, newElement);
      onSelectElement(newElement.id);
    }
  }, [onDuplicateElement, onUpdateElement, onSelectElement]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-white'} ${
        showBorder ? 'border-4 border-blue-500 border-solid' : ''
      }`}
      style={{
        ...style,
        width: canvasWidth,
        height: canvasHeight,
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      data-canvas-background="true"
    >
      {/* Grid background - should be rendered first */}
      <CanvasBackground 
        showGrid={showGrid} 
        gridSize={gridSize}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Smart snap guides */}
      <SmartSnapGuides
        guides={activeSnapGuides}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
      
      {/* Card side indicator */}
      <CanvasCardSideIndicator
        cardSide={cardSide}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Canvas elements - should render above everything else */}
      {elements.map((element) => (
        <EnhancedCanvasElementWrapper
          key={element.id}
          element={element}
          isSelected={selectedElement === element.id}
          isDragging={isDragging && dragElementId === element.id}
          editingElement={editingElement}
          zoom={zoom}
          availableElements={elements}
          onMouseDown={handleElementMouseDown}
          onClick={handleElementClick}
          onUpdateElement={onUpdateElement}
          onEditingChange={handleEditingChange}
          onDuplicate={handleDuplicateElement}
          onDelete={onDeleteElement}
        />
      ))}
      
      {/* Empty state - should render above everything */}
      {elements.length === 0 && <CanvasEmptyState />}
    </div>
  );
};
