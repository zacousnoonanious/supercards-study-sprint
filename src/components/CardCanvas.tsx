
import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CanvasElement } from '@/types/flashcard';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { ElementContextMenu } from './ElementContextMenu';
import { DrawingToolsPopup } from './DrawingToolsPopup';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { DrawingCanvas } from './DrawingCanvas';
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
      // Delete key
      if (event.key === 'Delete' && selectedElement) {
        onDeleteElement(selectedElement);
        setShowPopupFor(null);
        return;
      }

      // Escape key to deselect
      if (event.key === 'Escape') {
        onSelectElement(null);
        setEditingElement(null);
        setShowPopupFor(null);
        setShowDrawingTools(false);
        return;
      }

      // Keyboard shortcuts (only when not editing text)
      if (!editingElement && (event.ctrlKey || event.metaKey)) {
        switch (event.key.toLowerCase()) {
          case 'a':
            event.preventDefault();
            // Select all elements (could implement multi-select in future)
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

  // Improved popup position calculation
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

    // Keep popup within canvas bounds
    if (x + popupWidth > canvasWidth) {
      x = Math.max(10, element.x - popupWidth - 10);
    }

    if (y + popupHeight > canvasHeight) {
      y = Math.max(10, canvasHeight - popupHeight - 10);
    }

    // Ensure popup doesn't go above canvas
    if (y < 10) {
      y = 10;
    }

    // Final check to ensure popup is fully visible
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

    // Don't allow dragging when in drawing mode and it's a drawing element
    if (isDrawingMode && element.type === 'drawing' && action === 'drag') {
      return;
    }

    onSelectElement(elementId);
    
    // Only show popup for non-drawing elements or when not in drawing mode
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

  // Layer management functions
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
        // Bump up all other elements
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

    // This would need to be implemented in the parent component
    console.log('Duplicate element:', newElement);
  };

  const rotateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentRotation = element.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;
    onUpdateElement(elementId, { rotation: newRotation });
  };

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'multiple-choice':
        return <MultipleChoiceRenderer element={element} isEditing={true} />;
      case 'true-false':
        return <TrueFalseRenderer element={element} isEditing={true} />;
      case 'youtube':
        return <YouTubeRenderer element={element} />;
      case 'deck-embed':
        return <DeckEmbedRenderer element={element} />;
      case 'drawing':
        return (
          <DrawingCanvas
            width={element.width}
            height={element.height}
            onDrawingComplete={(drawingData, animated) => {
              onUpdateElement(element.id, { 
                drawingData,
                animated 
              });
            }}
            initialDrawing={element.drawingData}
            strokeColor={element.strokeColor}
            strokeWidth={element.strokeWidth}
            animated={element.animated}
          />
        );
      case 'audio':
        return (
          <div className={`w-full h-full flex items-center justify-center p-2 rounded border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          }`}>
            <audio controls className="w-full">
              <source src={element.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      case 'text':
        return (
          <div
            className={`w-full h-full flex items-center justify-center p-2 border rounded overflow-hidden cursor-text ${
              theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'
            }`}
            style={{
              fontSize: element.fontSize,
              color: element.color,
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textDecoration: element.textDecoration,
              textAlign: element.textAlign as React.CSSProperties['textAlign'],
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.detail === 2) {
                setEditingElement(element.id);
              }
            }}
          >
            {editingElement === element.id ? (
              <textarea
                value={element.content || ''}
                onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingElement(null);
                  }
                }}
                onBlur={() => setEditingElement(null)}
                className={`w-full h-full bg-transparent border-none outline-none resize-none ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
                style={{
                  fontSize: element.fontSize,
                  color: element.color,
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  textDecoration: element.textDecoration,
                  textAlign: element.textAlign as React.CSSProperties['textAlign'],
                  whiteSpace: 'pre-wrap',
                }}
                autoFocus
              />
            ) : (
              <span 
                className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
                style={{ textAlign: element.textAlign || 'center' }}
              >
                {element.content}
              </span>
            )}
          </div>
        );
      case 'image':
        return (
          <img
            src={element.imageUrl}
            alt="Element"
            className={`w-full h-full object-cover rounded border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}
            draggable={false}
          />
        );
      default:
        return null;
    }
  };

  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  // Find the selected element for the popup
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
        {/* Canvas background with grid */}
        <div className={`absolute inset-0 border-2 border-dashed rounded-lg ${
          isDarkTheme 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
        }`}>
          {snapToGrid && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle at ${gridSize}px ${gridSize}px, ${isDarkTheme ? '#ffffff' : '#000000'} 1px, transparent 0),
                  radial-gradient(circle at 0 0, ${isDarkTheme ? '#ffffff' : '#000000'} 1px, transparent 0)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          <div className={`absolute top-2 left-2 text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-400'}`}>
            {cardSide} side
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`px-2 py-1 text-xs rounded ${
                snapToGrid 
                  ? 'bg-blue-500 text-white' 
                  : isDarkTheme 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              Grid: {snapToGrid ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={autoArrangeElements}
              className={`px-2 py-1 text-xs rounded ${
                isDarkTheme 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Auto Arrange
            </button>
          </div>
        </div>

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
                
                // Only show popup for non-drawing elements
                if (element.type !== 'drawing') {
                  setShowPopupFor(element.id);
                  const position = calculatePopupPosition(element);
                  setPopupPosition(position);
                }
              }}
            >
              {renderElement(element)}

              {/* Resize handles - only show if not in drawing mode or not a drawing element */}
              {selectedElement === element.id && (!isDrawingMode || element.type !== 'drawing') && (
                <>
                  {['nw', 'ne', 'sw', 'se'].map((handle) => (
                    <div
                      key={handle}
                      className={`absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-${
                        handle === 'nw' || handle === 'se' ? 'nw' : 'ne'
                      }-resize`}
                      style={{
                        top: handle.includes('n') ? -6 : 'auto',
                        bottom: handle.includes('s') ? -6 : 'auto',
                        left: handle.includes('w') ? -6 : 'auto',
                        right: handle.includes('e') ? -6 : 'auto',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', handle)}
                    />
                  ))}
                </>
              )}
            </div>
          </ElementContextMenu>
        ))}

        {/* Popup Toolbar - Only render if element exists and is not a drawing element */}
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
