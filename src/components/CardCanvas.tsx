import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { QuizOnlyLayout } from './QuizOnlyLayout';
import { CanvasContextMenu } from './CanvasContextMenu';
import { ElementContextMenu } from './ElementContextMenu';
import { CanvasInteractionHandler } from './CanvasInteractionHandler';
import { CanvasBackground } from './CanvasBackground';
import { useTheme } from '@/contexts/ThemeContext';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  cardSide: 'front' | 'back';
  style?: React.CSSProperties;
  cardType?: Flashcard['card_type'];
  onAddElement?: (type: string, position?: number) => void;
  quizTitle?: string;
  onQuizTitleChange?: (title: string) => void;
  onAutoArrange?: () => void;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  dragStart: { x: number; y: number };
  elementStart: { x: number; y: number; width: number; height: number };
  resizeHandle?: string;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
  style = {},
  cardType = 'normal',
  onAddElement,
  quizTitle = '',
  onQuizTitleChange,
  onAutoArrange,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [contextMenuElement, setContextMenuElement] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize] = useState(20);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  const getElementPopupPosition = (element: CanvasElement) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRight = element.x + element.width;
    const elementTop = element.y;
    
    // Position popup to the right of the element, or to the left if not enough space
    const popupWidth = 250;
    const spaceOnRight = canvasRect.width - elementRight;
    
    if (spaceOnRight >= popupWidth + 20) {
      return { x: elementRight + 10, y: elementTop };
    } else {
      return { x: Math.max(10, element.x - popupWidth - 10), y: elementTop };
    }
  };

  const handleQuizAddElement = (type: string, position: number) => {
    if (onAddElement) {
      // Set zIndex to position for quiz layout
      onAddElement(type);
      // Update the last added element's position
      setTimeout(() => {
        const lastElement = elements[elements.length - 1];
        if (lastElement) {
          onUpdateElement(lastElement.id, { zIndex: position });
        }
      }, 100);
    }
  };

  const handleAutoArrange = () => {
    // Auto-arrange elements in a grid
    const cols = Math.ceil(Math.sqrt(elements.length));
    const cellWidth = 200;
    const cellHeight = 150;
    
    elements.forEach((element, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      onUpdateElement(element.id, {
        x: col * cellWidth + 20,
        y: row * cellHeight + 20,
      });
    });
  };

  const handleElementContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuElement(elementId);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    onSelectElement(elementId);
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      setContextMenuElement(null);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleElementLayerChange = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    let newZIndex = element.zIndex || 0;
    const allZIndexes = elements.map(el => el.zIndex || 0).sort((a, b) => a - b);
    
    switch (direction) {
      case 'up':
        newZIndex = Math.min(Math.max(...allZIndexes) + 1, newZIndex + 1);
        break;
      case 'down':
        newZIndex = Math.max(Math.min(...allZIndexes) - 1, newZIndex - 1);
        break;
      case 'top':
        newZIndex = Math.max(...allZIndexes) + 1;
        break;
      case 'bottom':
        newZIndex = Math.min(...allZIndexes) - 1;
        break;
    }

    onUpdateElement(elementId, { zIndex: newZIndex });
    setContextMenuElement(null);
    setContextMenuPosition(null);
  };

  const handleDuplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...element,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      x: element.x + 20,
      y: element.y + 20,
    };

    onUpdateElement(newElement.id, newElement);
    onSelectElement(newElement.id);
    setContextMenuElement(null);
    setContextMenuPosition(null);
  };

  const handleRotateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newRotation = ((element.rotation || 0) + 90) % 360;
    onUpdateElement(elementId, { rotation: newRotation });
    setContextMenuElement(null);
    setContextMenuPosition(null);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onSelectElement(elementId);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      isDragging: action === 'drag',
      isResizing: action === 'resize',
      dragStart: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
      elementStart: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      },
      resizeHandle,
    });
  }, [elements, onSelectElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragState.dragStart.x;
    const deltaY = currentY - dragState.dragStart.y;

    if (dragState.isDragging) {
      let newX = dragState.elementStart.x + deltaX;
      let newY = dragState.elementStart.y + deltaY;

      // Snap to grid if enabled
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Keep element within canvas bounds
      newX = Math.max(0, Math.min(newX, canvasRef.current.offsetWidth - dragState.elementStart.width));
      newY = Math.max(0, Math.min(newY, canvasRef.current.offsetHeight - dragState.elementStart.height));

      onUpdateElement(selectedElement, { x: newX, y: newY });
    } else if (dragState.isResizing && dragState.resizeHandle) {
      const handle = dragState.resizeHandle;
      let newWidth = dragState.elementStart.width;
      let newHeight = dragState.elementStart.height;
      let newX = dragState.elementStart.x;
      let newY = dragState.elementStart.y;

      // Handle corner resizing
      if (handle.includes('e')) {
        newWidth = dragState.elementStart.width + deltaX;
      }
      if (handle.includes('w')) {
        newWidth = dragState.elementStart.width - deltaX;
        newX = dragState.elementStart.x + deltaX;
      }
      if (handle.includes('s')) {
        newHeight = dragState.elementStart.height + deltaY;
      }
      if (handle.includes('n')) {
        newHeight = dragState.elementStart.height - deltaY;
        newY = dragState.elementStart.y + deltaY;
      }

      // Handle edge-only resizing
      if (handle === 'e') {
        newWidth = dragState.elementStart.width + deltaX;
      } else if (handle === 'w') {
        newWidth = dragState.elementStart.width - deltaX;
        newX = dragState.elementStart.x + deltaX;
      } else if (handle === 's') {
        newHeight = dragState.elementStart.height + deltaY;
      } else if (handle === 'n') {
        newHeight = dragState.elementStart.height - deltaY;
        newY = dragState.elementStart.y + deltaY;
      }

      // Minimum size constraints
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);

      // Snap to grid if enabled
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      onUpdateElement(selectedElement, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [dragState, selectedElement, onUpdateElement, snapToGrid, gridSize]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuElement(null);
      setContextMenuPosition(null);
    };

    if (contextMenuPosition) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuPosition]);

  // For quiz-only cards, use the specialized layout
  if (cardType === 'quiz-only') {
    return (
      <div
        ref={canvasRef}
        className={`relative border-2 border-dashed rounded-lg shadow-lg ${
          theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
        }`}
        style={{ 
          width: '800px', 
          height: '600px',
          minHeight: '600px',
          ...style 
        }}
      >
        <QuizOnlyLayout
          elements={elements}
          onAddElement={onAddElement || (() => {})}
          onUpdateElement={onUpdateElement}
          title={quizTitle}
          onTitleChange={onQuizTitleChange || (() => {})}
        />
      </div>
    );
  }

  // Determine canvas dimensions based on card type
  const getCanvasDimensions = () => {
    switch (cardType) {
      case 'simple':
        return { width: '600px', height: '900px' };
      case 'informational':
        return { width: '900px', height: '1800px' };
      case 'normal':
      default:
        return { width: '600px', height: '900px' };
    }
  };

  const canvasDimensions = getCanvasDimensions();

  return (
    <div
      ref={canvasRef}
      className={`relative border-2 border-dashed overflow-hidden rounded-lg shadow-lg ${
        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
      }`}
      style={{ 
        ...canvasDimensions,
        ...style 
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onSelectElement('canvas');
        }
      }}
      onContextMenu={handleCanvasContextMenu}
    >
      <CanvasBackground 
        cardSide={cardSide}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        onSnapToGridToggle={() => setSnapToGrid(!snapToGrid)}
      />
      
      {/* Render elements */}
      {elements.map((element) => (
        <ElementContextMenu
          key={element.id}
          onMoveUp={() => handleElementLayerChange(element.id, 'up')}
          onMoveDown={() => handleElementLayerChange(element.id, 'down')}
          onMoveToTop={() => handleElementLayerChange(element.id, 'top')}
          onMoveToBottom={() => handleElementLayerChange(element.id, 'bottom')}
          onDuplicate={() => handleDuplicateElement(element.id)}
          onDelete={() => onDeleteElement(element.id)}
          onRotate={() => handleRotateElement(element.id)}
        >
          <div
            className={`absolute cursor-move ${
              selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
            } ${cardType === 'simple' ? 'pointer-events-none' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation || 0}deg)`,
              transformOrigin: 'center',
              zIndex: element.zIndex || 0,
            }}
            onMouseDown={(e) => {
              if (cardType === 'simple') return; // Disable dragging for simple cards
              if (element.type === 'drawing') {
                return;
              }
              handleMouseDown(e, element.id, 'drag');
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(element.id);
            }}
            onContextMenu={(e) => handleElementContextMenu(e, element.id)}
          >
            <CanvasElementRenderer
              element={element}
              editingElement={editingElement}
              onUpdateElement={onUpdateElement}
              onEditingChange={setEditingElement}
              onElementDragStart={(e, elementId) => handleMouseDown(e, elementId, 'drag')}
              isDragging={dragState?.isDragging && selectedElement === element.id}
            />
          </div>
        </ElementContextMenu>
      ))}

      {/* Resize handles for selected element - disabled for simple cards */}
      {selectedElement && selectedElement !== 'canvas' && selectedElementData && cardType !== 'simple' && (
        <CanvasInteractionHandler
          selectedElement={selectedElement}
          selectedElementData={selectedElementData}
          dragState={dragState}
          onMouseDown={handleMouseDown}
          isDrawingMode={false}
        />
      )}

      {/* Canvas Context Menu */}
      {contextMenuPosition && !contextMenuElement && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000,
          }}
        >
          <CanvasContextMenu
            onUndo={() => {}}
            onRedo={() => {}}
            canUndo={false}
            canRedo={false}
            onChangeBackground={() => {}}
            onToggleGrid={() => setSnapToGrid(!snapToGrid)}
            onSettings={() => {}}
          >
            <div />
          </CanvasContextMenu>
        </div>
      )}
    </div>
  );
};
