import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { QuizOnlyLayout } from './QuizOnlyLayout';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { CanvasContextMenu } from './CanvasContextMenu';
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
  cardType = 'standard',
  onAddElement,
  quizTitle = '',
  onQuizTitleChange,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [popupToolbar, setPopupToolbar] = useState<{ element: CanvasElement; position: { x: number; y: number } } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize] = useState(20);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  // For quiz-only cards, use the specialized layout
  if (cardType === 'quiz-only') {
    return (
      <div
        ref={canvasRef}
        className={`relative border-2 border-dashed rounded-lg ${
          theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
        }`}
        style={{ 
          width: '100%', 
          height: '600px',
          minHeight: '600px',
          ...style 
        }}
      >
        <QuizOnlyLayout
          elements={elements}
          onAddElement={handleQuizAddElement}
          onUpdateElement={onUpdateElement}
          title={quizTitle}
          onTitleChange={onQuizTitleChange || (() => {})}
        />
      </div>
    );
  }

  // For informational cards, make canvas taller to accommodate more content
  const canvasHeight = cardType === 'informational' ? '800px' : '533px';

  return (
    <div
      ref={canvasRef}
      className={`relative border-2 border-dashed overflow-hidden rounded-lg ${
        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
      }`}
      style={{ 
        width: '800px', 
        height: canvasHeight,
        aspectRatio: cardType === 'informational' ? 'unset' : '3/2',
        ...style 
      }}
      onMouseDown={(e) => {
        // Deselect element when clicking on empty canvas
        if (e.target === e.currentTarget) {
          onSelectElement(null);
        }
      }}
    >
      <CanvasBackground 
        cardSide={cardSide}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        onSnapToGridToggle={() => setSnapToGrid(!snapToGrid)}
        onAutoArrange={handleAutoArrange}
      />
      
      {/* Render elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-move ${
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
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          onClick={(e) => {
            e.stopPropagation();
            onSelectElement(element.id);
          }}
        >
          <CanvasElementRenderer
            element={element}
            editingElement={editingElement}
            onUpdateElement={onUpdateElement}
            onEditingChange={setEditingElement}
          />
        </div>
      ))}

      {/* Resize handles for selected element */}
      {selectedElement && (
        <CanvasInteractionHandler
          selectedElement={selectedElement}
          dragState={dragState}
          onMouseDown={handleMouseDown}
          isDrawingMode={false}
        />
      )}

      {/* Popup Toolbar */}
      {popupToolbar && (
        <ElementPopupToolbar
          element={popupToolbar.element}
          onUpdate={(updates) => onUpdateElement(popupToolbar.element.id, updates)}
          onDelete={() => {
            onDeleteElement(popupToolbar.element.id);
            setPopupToolbar(null);
          }}
          position={popupToolbar.position}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
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
      )}
    </div>
  );
};
