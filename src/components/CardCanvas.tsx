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
  autoAlign?: boolean;
  zoom?: number;
  onDuplicateElement?: (element: CanvasElement) => void;
}

/**
 * CardCanvas Component
 * 
 * Main canvas component with PROTECTED visual editor features.
 * CRITICAL: This component maintains all visual editing features
 * including grid, snap, border, and auto-align functionality with protection against resets.
 */
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
  autoAlign = false,
  zoom = 1,
  onDuplicateElement,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Get canvas dimensions from style with validation
  const canvasWidth = (style?.width as number) || 600;
  const canvasHeight = (style?.height as number) || 450;

  // Validate canvas dimensions
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    console.error('❌ CardCanvas: Invalid canvas dimensions:', { canvasWidth, canvasHeight });
  }

  const {
    calculateSnapPosition,
    clearSnapGuides,
    activeSnapGuides,
  } = useSmartSnapping({
    elements,
    canvasWidth,
    canvasHeight,
    snapThreshold: autoAlign ? 15 : 5, // Larger magnetic threshold when auto-align is enabled
  });

  const {
    applyConstraints,
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
    getElementPosition,
    clearClientPosition,
  } = useCanvasDragResize({
    elements,
    onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => {
      // Apply smart snapping to final position during database save
      if (updates.x !== undefined && updates.y !== undefined && autoAlign) {
        const element = elements.find(el => el.id === elementId);
        if (element) {
          console.log('🔧 Applying auto-align snap for element:', elementId, 'Original pos:', updates.x, updates.y);
          const snapped = calculateSnapPosition(element, updates.x, updates.y);
          updates.x = snapped.x;
          updates.y = snapped.y;
          console.log('🔧 Auto-aligned position:', snapped.x, snapped.y);
        }
      } else if (updates.x !== undefined && updates.y !== undefined && snapToGrid) {
        // Apply grid snapping if auto-align is off but grid snap is on
        const gridX = Math.round(updates.x / gridSize) * gridSize;
        const gridY = Math.round(updates.y / gridSize) * gridSize;
        updates.x = gridX;
        updates.y = gridY;
        console.log('🔧 Grid snapped position:', gridX, gridY);
      }
      
      // Update database with final position
      onUpdateElement(elementId, updates);
      
      // Clear client position immediately after database update to prevent flickering
      setTimeout(() => {
        clearClientPosition(elementId);
      }, 50);
      
      // Apply layout constraints after database update
      setTimeout(() => {
        applyConstraints(elementId);
      }, 100);
    },
    canvasWidth,
    canvasHeight,
    snapToGrid: snapToGrid && !autoAlign, // Disable grid snap when auto-align is enabled
    gridSize,
    zoom,
    calculateSnapPosition: autoAlign ? calculateSnapPosition : undefined, // Pass snap calculator for magnetic behavior
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
      // Get mouse position relative to canvas, accounting for zoom
      const canvasX = (e.clientX - rect.left) * zoom;
      const canvasY = (e.clientY - rect.top) * zoom;
      
      updateDragStart(canvasX, canvasY);
      startDragOrResize(e, elementId, action, handle);
    }
  }, [onSelectElement, editingElement, updateDragStart, startDragOrResize, zoom]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMouseMove(e, rect);
      
      // Show snap guides during drag when auto-align is enabled and actively dragging
      if (autoAlign && isDragging && dragElementId) {
        const draggedElement = elements.find(el => el.id === dragElementId);
        if (draggedElement) {
          const canvasX = (e.clientX - rect.left) / zoom;
          const canvasY = (e.clientY - rect.top) / zoom;
          calculateSnapPosition(draggedElement, canvasX, canvasY);
        }
      }
    }
  }, [handleMouseMove, isDragging, isResizing, autoAlign, dragElementId, elements, zoom, calculateSnapPosition]);

  const handleMouseUpOrLeave = useCallback(() => {
    endDragOrResize();
    // Always clear snap guides when drag/resize ends
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
      clearSnapGuides();
    }
  }, [onSelectElement, clearSnapGuides]);

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

  const handleApplyConstraints = useCallback((elementId: string) => {
    applyConstraints(elementId);
  }, [applyConstraints]);

  // Create enhanced elements with client-side positions during drag, original positions otherwise
  const enhancedElements = elements.map(element => {
    // Only override position if this element is currently being dragged/resized
    const clientPosition = getElementPosition(element.id);
    if (clientPosition && dragElementId === element.id && (isDragging || isResizing)) {
      return { ...element, ...clientPosition };
    }
    // Use original element position from database/props
    return element;
  });

  /**
   * PROTECTED: Generate border styles with enhanced protection
   * CRITICAL: This styling is essential for visual editing experience
   */
  const getBorderStyles = useCallback(() => {
    console.log('🔧 PROTECTED: Generating border styles, showBorder:', showBorder);
    if (!showBorder) {
      console.log('🔧 PROTECTED: No border - returning empty styles');
      return {};
    }
    
    const borderStyles = {
      border: '4px solid #3b82f6', // Blue border for visibility
      borderStyle: 'solid',
      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3)', // Subtle glow effect
    };
    
    console.log('🔧 PROTECTED: Border styles applied:', borderStyles);
    return borderStyles;
  }, [showBorder]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
      style={{
        ...style,
        width: canvasWidth,
        height: canvasHeight,
        cursor: isDragging ? 'grabbing' : 'default',
        ...getBorderStyles(), // Apply PROTECTED border styles
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      data-canvas-background="true"
    >
      {/* PROTECTED: Canvas Background with Grid - CRITICAL for visual editing */}
      <CanvasBackground 
        showGrid={showGrid} 
        gridSize={gridSize}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Smart Snap Guides - Only show during active dragging when auto-align is enabled */}
      {autoAlign && isDragging && (
        <SmartSnapGuides
          guides={activeSnapGuides}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      )}
      
      {/* Card Side Indicator */}
      <CanvasCardSideIndicator
        cardSide={cardSide}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Render all canvas elements */}
      {enhancedElements.map((element) => (
        <div key={element.id}>
          <EnhancedCanvasElementWrapper
            element={element}
            isSelected={selectedElement === element.id}
            isDragging={isDragging && dragElementId === element.id}
            editingElement={editingElement}
            zoom={zoom}
            availableElements={enhancedElements}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onMouseDown={handleElementMouseDown}
            onClick={handleElementClick}
            onUpdateElement={onUpdateElement}
            onEditingChange={handleEditingChange}
            onDuplicate={handleDuplicateElement}
            onDelete={onDeleteElement}
            onApplyConstraints={handleApplyConstraints}
          />
        </div>
      ))}
      
      {/* Empty State */}
      {elements.length === 0 && <CanvasEmptyState />}
    </div>
  );
};
