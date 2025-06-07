
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { ElementContextMenu } from './ElementContextMenu';

interface PowerPointEditorProps {
  elements: CanvasElement[];
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onAddElement: (type: CanvasElement['type']) => void;
  onDeleteElement: (elementId: string) => void;
  cardWidth: number;
  cardHeight: number;
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  showGrid: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

export const PowerPointEditor: React.FC<PowerPointEditorProps> = ({
  elements,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  cardWidth,
  cardHeight,
  selectedElementId,
  onElementSelect,
  showGrid,
  snapToGrid = false,
  gridSize = 20,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  
  // Local state for real-time updates during interactions
  const [localElements, setLocalElements] = useState<CanvasElement[]>(elements);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, Partial<CanvasElement>>>(new Map());

  // Sync external elements with local state
  useEffect(() => {
    setLocalElements(elements);
    setPendingUpdates(new Map());
  }, [elements]);

  // Update local element immediately for UI responsiveness
  const updateLocalElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setLocalElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
    
    // Track pending updates for database save
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(elementId) || {};
      newMap.set(elementId, { ...existing, ...updates });
      return newMap;
    });
  }, []);

  // Save pending updates to database
  const savePendingUpdates = useCallback(() => {
    pendingUpdates.forEach((updates, elementId) => {
      onUpdateElement(elementId, updates);
    });
    setPendingUpdates(new Map());
  }, [pendingUpdates, onUpdateElement]);

  // Snap to grid helper
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Delete key
    if (e.key === 'Delete' && selectedElementId) {
      e.preventDefault();
      onDeleteElement(selectedElementId);
      return;
    }

    // Copy (Ctrl+C)
    if (e.ctrlKey && e.key === 'c' && selectedElementId) {
      e.preventDefault();
      const elementToCopy = localElements.find(el => el.id === selectedElementId);
      if (elementToCopy) {
        setCopiedElement(elementToCopy);
      }
      return;
    }

    // Paste (Ctrl+V)
    if (e.ctrlKey && e.key === 'v' && copiedElement) {
      e.preventDefault();
      const newElement: CanvasElement = {
        ...copiedElement,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: copiedElement.x + 20,
        y: copiedElement.y + 20,
        zIndex: (localElements.length || 0) + 1,
      };
      
      const updatedElements = [...localElements, newElement];
      setLocalElements(updatedElements);
      onUpdateElement(newElement.id, newElement);
      onElementSelect(newElement.id);
      return;
    }
  }, [selectedElementId, localElements, copiedElement, onDeleteElement, onUpdateElement, onElementSelect]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    onElementSelect(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const element = localElements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    let newX = Math.max(0, Math.min(element.x + deltaX, cardWidth - element.width));
    let newY = Math.max(0, Math.min(element.y + deltaY, cardHeight - element.height));
    
    // Apply grid snapping
    newX = snapToGridValue(newX);
    newY = snapToGridValue(newY);
    
    // Update local state immediately for smooth dragging
    updateLocalElement(selectedElementId, { x: newX, y: newY });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isDragging, selectedElementId, dragStart, localElements, cardWidth, cardHeight, updateLocalElement, snapToGridValue]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Save to database when dragging stops
      savePendingUpdates();
    }
    if (isResizing) {
      setIsResizing(false);
      // Save to database when resizing stops
      savePendingUpdates();
    }
  }, [isDragging, isResizing, savePendingUpdates]);

  const handleResizeStart = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    onElementSelect(elementId);
    setIsResizing(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [onElementSelect]);

  const handleResize = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !selectedElementId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const element = localElements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    let newWidth = Math.max(50, Math.min(element.width + deltaX, cardWidth - element.x));
    let newHeight = Math.max(30, Math.min(element.height + deltaY, cardHeight - element.y));
    
    // Apply grid snapping
    newWidth = snapToGridValue(newWidth);
    newHeight = snapToGridValue(newHeight);
    
    // Update local state immediately for smooth resizing
    updateLocalElement(selectedElementId, { width: newWidth, height: newHeight });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isResizing, selectedElementId, dragStart, localElements, cardWidth, cardHeight, updateLocalElement, snapToGridValue]);

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        const syntheticEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent;
        
        if (isDragging) {
          handleMouseMove(syntheticEvent);
        } else if (isResizing) {
          handleResize(syntheticEvent);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleResize, handleMouseUp]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingElementId(elementId);
  }, []);

  const handleTextChange = useCallback((elementId: string, newContent: string) => {
    // Update immediately in local state
    updateLocalElement(elementId, { content: newContent });
  }, [updateLocalElement]);

  const handleTextBlur = useCallback(() => {
    setEditingElementId(null);
    // Save text changes to database
    savePendingUpdates();
  }, [savePendingUpdates]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  // Context menu handlers for elements
  const handleElementContextMenu = (elementId: string) => ({
    onMoveUp: () => {
      const element = localElements.find(el => el.id === elementId);
      if (element) {
        updateLocalElement(elementId, { zIndex: (element.zIndex || 0) + 1 });
        savePendingUpdates();
      }
    },
    onMoveDown: () => {
      const element = localElements.find(el => el.id === elementId);
      if (element && (element.zIndex || 0) > 0) {
        updateLocalElement(elementId, { zIndex: (element.zIndex || 0) - 1 });
        savePendingUpdates();
      }
    },
    onMoveToTop: () => {
      const maxZ = Math.max(...localElements.map(el => el.zIndex || 0));
      updateLocalElement(elementId, { zIndex: maxZ + 1 });
      savePendingUpdates();
    },
    onMoveToBottom: () => {
      updateLocalElement(elementId, { zIndex: 0 });
      savePendingUpdates();
    },
    onDuplicate: () => {
      const elementToDuplicate = localElements.find(el => el.id === elementId);
      if (elementToDuplicate) {
        const newElement: CanvasElement = {
          ...elementToDuplicate,
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: elementToDuplicate.x + 20,
          y: elementToDuplicate.y + 20,
          zIndex: (localElements.length || 0) + 1,
        };
        
        const updatedElements = [...localElements, newElement];
        setLocalElements(updatedElements);
        onUpdateElement(newElement.id, newElement);
        onElementSelect(newElement.id);
      }
    },
    onDelete: () => {
      onDeleteElement(elementId);
    },
    onRotate: () => {
      const element = localElements.find(el => el.id === elementId);
      if (element) {
        const newRotation = ((element.rotation || 0) + 90) % 360;
        updateLocalElement(elementId, { rotation: newRotation });
        savePendingUpdates();
      }
    },
  });

  // Use local elements for rendering
  const currentElements = localElements;

  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="relative">
        <div
          ref={canvasRef}
          className="relative border-2 border-gray-300 bg-white shadow-lg overflow-hidden cursor-default focus:outline-none"
          style={{ width: cardWidth, height: cardHeight }}
          onClick={handleCanvasClick}
          tabIndex={0}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at ${gridSize}px ${gridSize}px, #000 1px, transparent 0),
                  radial-gradient(circle at 0 0, #000 1px, transparent 0)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}

          {currentElements.map((element) => (
            <ElementContextMenu
              key={element.id}
              {...handleElementContextMenu(element.id)}
            >
              <div
                className={`absolute select-none cursor-move ${
                  selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''
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
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDoubleClick={(e) => handleDoubleClick(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onElementSelect(element.id);
                }}
              >
                {element.type === 'text' ? (
                  editingElementId === element.id ? (
                    <textarea
                      className="w-full h-full border-none outline-none resize-none bg-transparent"
                      style={{
                        fontSize: element.fontSize || 16,
                        color: element.color || '#000000',
                        fontWeight: element.fontWeight || 'normal',
                        fontStyle: element.fontStyle || 'normal',
                        textDecoration: element.textDecoration || 'none',
                        textAlign: element.textAlign || 'left',
                      }}
                      value={element.content || ''}
                      onChange={(e) => handleTextChange(element.id, e.target.value)}
                      onBlur={handleTextBlur}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-center break-words overflow-hidden"
                      style={{
                        fontSize: element.fontSize || 16,
                        color: element.color || '#000000',
                        fontWeight: element.fontWeight || 'normal',
                        fontStyle: element.fontStyle || 'normal',
                        textDecoration: element.textDecoration || 'none',
                        textAlign: element.textAlign || 'left',
                      }}
                    >
                      {element.content || 'Double-click to edit'}
                    </div>
                  )
                ) : element.type === 'image' ? (
                  <img
                    src={element.content || '/placeholder.svg'}
                    alt="Card element"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : element.type === 'multiple-choice' ? (
                  <MultipleChoiceRenderer 
                    element={element} 
                    isEditing={true}
                    onUpdate={(updates) => updateLocalElement(element.id, updates)}
                  />
                ) : element.type === 'true-false' ? (
                  <TrueFalseRenderer 
                    element={element} 
                    isEditing={true}
                    onUpdate={(updates) => updateLocalElement(element.id, updates)}
                  />
                ) : element.type === 'youtube' ? (
                  <YouTubeRenderer element={element} />
                ) : element.type === 'deck-embed' ? (
                  <DeckEmbedRenderer 
                    element={element}
                    isEditing={true}
                    onUpdate={(updates) => updateLocalElement(element.id, updates)}
                  />
                ) : null}

                {selectedElementId === element.id && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                    onMouseDown={(e) => handleResizeStart(e, element.id)}
                  />
                )}
              </div>
            </ElementContextMenu>
          ))}

          {currentElements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
              <div className="text-center">
                <p>No elements yet</p>
                <p className="text-sm mt-2">Use the toolbar above to add elements</p>
                <p className="text-xs mt-1">Press Delete to remove, Ctrl+C to copy, Ctrl+V to paste</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
