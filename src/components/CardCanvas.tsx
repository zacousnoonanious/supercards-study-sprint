
import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CanvasElement } from '@/types/flashcard';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { ElementContextMenu } from './ElementContextMenu';
import { DrawingToolsPopup } from './DrawingToolsPopup';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { CanvasBackground } from './CanvasBackground';
import { CanvasInteractionHandler } from './CanvasInteractionHandler';
import { useTheme } from '@/contexts/ThemeContext';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  cardSide: 'front' | 'back';
  cardType?: 'standard' | 'informational' | 'single-sided' | 'password-protected' | 'quiz-only' | 'timed-challenge';
  style?: React.CSSProperties;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
  cardType = 'standard',
  style,
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    isResizing: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number; width: number; height: number };
    resizeHandle?: string;
  } | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [showPopupFor, setShowPopupFor] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [drawingToolsPosition, setDrawingToolsPosition] = useState({ x: 400, y: 100 });
  const [drawingTool, setDrawingTool] = useState<'brush' | 'eraser'>('brush');

  const gridSize = 20;

  const snapToGridIfEnabled = (value: number) => {
    return snapToGrid ? Math.round(value / gridSize) * gridSize : value;
  };

  // Handle keyboard shortcuts and delete key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedElement) {
        onDeleteElement(selectedElement);
        setShowPopupFor(null);
        return;
      }

      if (event.key === 'Escape') {
        onSelectElement(null);
        setEditingElement(null);
        setShowPopupFor(null);
        setShowDrawingTools(false);
        return;
      }

      if (!editingElement && (event.ctrlKey || event.metaKey)) {
        switch (event.key.toLowerCase()) {
          case 'a':
            event.preventDefault();
            break;
          case 'o':
            event.preventDefault();
            autoArrangeElements();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, onDeleteElement, editingElement, onSelectElement]);

  useEffect(() => {
    const handleDeleteElement = (event: CustomEvent) => {
      const elementId = event.detail;
      onDeleteElement(elementId);
      setShowPopupFor(null);
    };

    window.addEventListener('deleteElement', handleDeleteElement as EventListener);
    return () => {
      window.removeEventListener('deleteElement', handleDeleteElement as EventListener);
    };
  }, [onDeleteElement]);

  // Check if selected element is a drawing element
  useEffect(() => {
    const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;
    const isDrawing = selectedElementData?.type === 'drawing';
    setIsDrawingMode(isDrawing);
    
    if (isDrawing && !showDrawingTools) {
      setShowDrawingTools(true);
    } else if (!isDrawing && showDrawingTools) {
      setShowDrawingTools(false);
    }
  }, [selectedElement, elements]);

  const calculatePopupPosition = (element: CanvasElement) => {
    if (!canvasRef.current) return { x: element.x + element.width, y: element.y };

    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;
    const popupWidth = 250;
    const popupHeight = 300;

    let x = element.x + element.width + 10;
    let y = element.y;

    if (x + popupWidth > canvasWidth) {
      x = Math.max(10, element.x - popupWidth - 10);
    }

    if (y + popupHeight > canvasHeight) {
      y = Math.max(10, canvasHeight - popupHeight - 10);
    }

    if (y < 10) {
      y = 10;
    }

    if (x < 10) {
      x = 10;
    }

    if (x + popupWidth > canvasWidth) {
      x = Math.max(10, canvasWidth - popupWidth - 10);
    }

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (isDrawingMode && element.type === 'drawing' && action === 'drag') {
      return;
    }

    onSelectElement(elementId);
    
    if (element.type !== 'drawing' || !isDrawingMode) {
      setShowPopupFor(elementId);
      const position = calculatePopupPosition(element);
      setPopupPosition(position);
    }
    
    setDragState({
      isDragging: action === 'drag',
      isResizing: action === 'resize',
      dragStart: { x: e.clientX, y: e.clientY },
      elementStart: { 
        x: element.x, 
        y: element.y,
        width: element.width,
        height: element.height
      },
      resizeHandle
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !selectedElement) return;

    const deltaX = e.clientX - dragState.dragStart.x;
    const deltaY = e.clientY - dragState.dragStart.y;

    if (dragState.isDragging) {
      const newX = snapToGridIfEnabled(Math.max(0, dragState.elementStart.x + deltaX));
      const newY = snapToGridIfEnabled(Math.max(0, dragState.elementStart.y + deltaY));
      
      onUpdateElement(selectedElement, { x: newX, y: newY });
      
      if (showPopupFor === selectedElement) {
        const element = elements.find(el => el.id === selectedElement);
        if (element) {
          const updatedElement = { ...element, x: newX, y: newY };
          const position = calculatePopupPosition(updatedElement);
          setPopupPosition(position);
        }
      }
    } else if (dragState.isResizing && dragState.resizeHandle) {
      const updates: Partial<CanvasElement> = {};
      
      switch (dragState.resizeHandle) {
        case 'se':
          updates.width = snapToGridIfEnabled(Math.max(20, dragState.elementStart.width + deltaX));
          updates.height = snapToGridIfEnabled(Math.max(20, dragState.elementStart.height + deltaY));
          break;
        case 'sw':
          updates.width = snapToGridIfEnabled(Math.max(20, dragState.elementStart.width - deltaX));
          updates.height = snapToGridIfEnabled(Math.max(20, dragState.elementStart.height + deltaY));
          updates.x = snapToGridIfEnabled(dragState.elementStart.x + deltaX);
          break;
        case 'ne':
          updates.width = snapToGridIfEnabled(Math.max(20, dragState.elementStart.width + deltaX));
          updates.height = snapToGridIfEnabled(Math.max(20, dragState.elementStart.height - deltaY));
          updates.y = snapToGridIfEnabled(dragState.elementStart.y + deltaY);
          break;
        case 'nw':
          updates.width = snapToGridIfEnabled(Math.max(20, dragState.elementStart.width - deltaX));
          updates.height = snapToGridIfEnabled(Math.max(20, dragState.elementStart.height - deltaY));
          updates.x = snapToGridIfEnabled(dragState.elementStart.x + deltaX);
          updates.y = snapToGridIfEnabled(dragState.elementStart.y + deltaY);
          break;
      }
      
      onUpdateElement(selectedElement, updates);
      
      if (showPopupFor === selectedElement) {
        const element = elements.find(el => el.id === selectedElement);
        if (element) {
          const updatedElement = { ...element, ...updates };
          const position = calculatePopupPosition(updatedElement);
          setPopupPosition(position);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setEditingElement(null);
      setShowPopupFor(null);
      setShowDrawingTools(false);
    }
  };

  const autoArrangeElements = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const padding = 20;
    const cols = Math.ceil(Math.sqrt(elements.length));
    const cellWidth = (canvasWidth - padding * 2) / cols;
    const cellHeight = (canvasHeight - padding * 2) / Math.ceil(elements.length / cols);

    elements.forEach((element, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = padding + col * cellWidth + (cellWidth - element.width) / 2;
      const y = padding + row * cellHeight + (cellHeight - element.height) / 2;
      
      onUpdateElement(element.id, { 
        x: Math.max(0, Math.min(x, canvasWidth - element.width)),
        y: Math.max(0, Math.min(y, canvasHeight - element.height))
      });
    });
  };

  const moveElementLayer = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;

    const maxZ = Math.max(...elements.map(el => el.zIndex || 0));
    let newZIndex = 0;
    
    switch (direction) {
      case 'up':
        newZIndex = (elements.find(el => el.id === elementId)?.zIndex || 0) + 1;
        break;
      case 'down':
        newZIndex = Math.max((elements.find(el => el.id === elementId)?.zIndex || 0) - 1, 0);
        break;
      case 'top':
        newZIndex = maxZ + 1;
        break;
      case 'bottom':
        newZIndex = 0;
        elements.forEach(el => {
          if (el.id !== elementId) {
            onUpdateElement(el.id, { zIndex: (el.zIndex || 0) + 1 });
          }
        });
        break;
    }
    
    onUpdateElement(elementId, { zIndex: newZIndex });
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...element,
      id: `${Date.now()}-${Math.random()}`,
      x: element.x + 20,
      y: element.y + 20,
    };

    console.log('Duplicate element:', newElement);
  };

  const rotateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentRotation = element.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;
    onUpdateElement(elementId, { rotation: newRotation });
  };

  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';
  const popupElement = showPopupFor ? elements.find(el => el.id === showPopupFor) : null;
  const selectedDrawingElement = selectedElement ? elements.find(el => el.id === selectedElement && el.type === 'drawing') : null;

  return (
    <Card className={`relative overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`} style={style || { aspectRatio: '3/2', minHeight: '400px' }}>
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <CanvasBackground
          cardSide={cardSide}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          onSnapToGridToggle={() => setSnapToGrid(!snapToGrid)}
          onAutoArrange={autoArrangeElements}
        />

        {/* Render elements */}
        {elements
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((element) => (
          <ElementContextMenu
            key={element.id}
            onMoveUp={() => moveElementLayer(element.id, 'up')}
            onMoveDown={() => moveElementLayer(element.id, 'down')}
            onMoveToTop={() => moveElementLayer(element.id, 'top')}
            onMoveToBottom={() => moveElementLayer(element.id, 'bottom')}
            onDuplicate={() => duplicateElement(element.id)}
            onDelete={() => onDeleteElement(element.id)}
            onRotate={() => rotateElement(element.id)}
          >
            <div
              className={`absolute ${
                selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
              } ${isDrawingMode && element.type === 'drawing' ? 'cursor-crosshair' : 'cursor-move'}`}
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
                
                if (element.type !== 'drawing') {
                  setShowPopupFor(element.id);
                  const position = calculatePopupPosition(element);
                  setPopupPosition(position);
                }
              }}
            >
              <CanvasElementRenderer
                element={element}
                editingElement={editingElement}
                onUpdateElement={onUpdateElement}
                onEditingChange={setEditingElement}
              />

              {selectedElement === element.id && (!isDrawingMode || element.type !== 'drawing') && (
                <CanvasInteractionHandler
                  selectedElement={selectedElement}
                  dragState={dragState}
                  onMouseDown={handleMouseDown}
                  isDrawingMode={isDrawingMode}
                />
              )}
            </div>
          </ElementContextMenu>
        ))}

        {/* Popup Toolbar */}
        {showPopupFor && popupElement && popupElement.type !== 'drawing' && (
          <ElementPopupToolbar
            element={popupElement}
            onUpdate={(updates) => onUpdateElement(showPopupFor, updates)}
            onDelete={() => {
              onDeleteElement(showPopupFor);
              setShowPopupFor(null);
            }}
            position={popupPosition}
          />
        )}

        {/* Drawing Tools Popup */}
        {showDrawingTools && selectedDrawingElement && (
          <DrawingToolsPopup
            position={drawingToolsPosition}
            onPositionChange={setDrawingToolsPosition}
            onClose={() => setShowDrawingTools(false)}
            strokeColor={selectedDrawingElement.strokeColor || '#000000'}
            strokeWidth={selectedDrawingElement.strokeWidth || 2}
            tool={drawingTool}
            onStrokeColorChange={(color) => onUpdateElement(selectedDrawingElement.id, { strokeColor: color })}
            onStrokeWidthChange={(width) => onUpdateElement(selectedDrawingElement.id, { strokeWidth: width })}
            onToolChange={setDrawingTool}
            onClear={() => onUpdateElement(selectedDrawingElement.id, { drawingData: '' })}
          />
        )}
      </div>
    </Card>
  );
};
