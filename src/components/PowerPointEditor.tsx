import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { ElementContextMenu } from './ElementContextMenu';
import { ElementPopupToolbar } from './ElementPopupToolbar';

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
  snapPrecision?: 'coarse' | 'medium' | 'fine';
  showBorder?: boolean;
  onCanvasSizeChange?: (newWidth: number, newHeight: number) => void;
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
  snapPrecision = 'medium',
  showBorder = false,
  onCanvasSizeChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isCanvasResizing, setIsCanvasResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null);
  const [showPopupToolbar, setShowPopupToolbar] = useState(false);
  
  // Local state for real-time updates during interactions
  const [localElements, setLocalElements] = useState<CanvasElement[]>(elements);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, Partial<CanvasElement>>>(new Map());
  
  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Schedule auto-save
    scheduleAutoSave();
  }, []);

  // Schedule auto-save with debouncing
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      savePendingUpdates();
    }, 1000); // Save after 1 second of inactivity
  }, []);

  // Save pending updates to database
  const savePendingUpdates = useCallback(() => {
    if (pendingUpdates.size === 0) return;
    
    console.log('PowerPointEditor: Saving pending updates:', pendingUpdates.size, 'elements');
    
    pendingUpdates.forEach((updates, elementId) => {
      onUpdateElement(elementId, updates);
    });
    setPendingUpdates(new Map());
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, [pendingUpdates, onUpdateElement]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Save any pending updates on unmount
      if (pendingUpdates.size > 0) {
        pendingUpdates.forEach((updates, elementId) => {
          onUpdateElement(elementId, updates);
        });
      }
    };
  }, [pendingUpdates, onUpdateElement]);

  // Snap to grid helper with precision levels
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value;
    
    let effectiveGridSize = gridSize;
    switch (snapPrecision) {
      case 'coarse':
        effectiveGridSize = gridSize * 2;
        break;
      case 'fine':
        effectiveGridSize = gridSize / 2;
        break;
      default: // medium
        effectiveGridSize = gridSize;
    }
    
    return Math.round(value / effectiveGridSize) * effectiveGridSize;
  }, [snapToGrid, gridSize, snapPrecision]);

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

    // Show popup toolbar (Space key)
    if (e.key === ' ' && selectedElementId && !editingElementId) {
      e.preventDefault();
      setShowPopupToolbar(true);
      return;
    }

    // Hide popup toolbar (Escape key)
    if (e.key === 'Escape') {
      setShowPopupToolbar(false);
      setEditingElementId(null);
    }

    // Save changes (Ctrl+S)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      savePendingUpdates();
      return;
    }
  }, [selectedElementId, localElements, copiedElement, editingElementId, onDeleteElement, onUpdateElement, onElementSelect, savePendingUpdates]);

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
    setShowPopupToolbar(false);
    
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
    
    // Apply grid snapping locally (client-side only)
    newX = snapToGridValue(newX);
    newY = snapToGridValue(newY);
    
    // Update local state immediately for smooth dragging
    updateLocalElement(selectedElementId, { x: newX, y: newY });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isDragging, selectedElementId, dragStart, localElements, cardWidth, cardHeight, updateLocalElement, snapToGridValue]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      console.log('PowerPointEditor: Drag ended, scheduling save');
    }
    if (isResizing) {
      setIsResizing(false);
      console.log('PowerPointEditor: Resize ended, scheduling save');
    }
  }, [isDragging, isResizing]);

  // Canvas resize handlers
  const handleCanvasResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsCanvasResizing(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleCanvasResize = useCallback((e: React.MouseEvent) => {
    if (!isCanvasResizing || !onCanvasSizeChange) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    let newWidth = Math.max(200, Math.min(cardWidth + deltaX, 2000));
    let newHeight = Math.max(200, Math.min(cardHeight + deltaY, 2000));
    
    // Apply grid snapping
    newWidth = snapToGridValue(newWidth);
    newHeight = snapToGridValue(newHeight);
    
    onCanvasSizeChange(newWidth, newHeight);
    
    setDragStart({ x: currentX, y: currentY });
  }, [isCanvasResizing, dragStart, cardWidth, cardHeight, onCanvasSizeChange, snapToGridValue]);

  // Resize handlers
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
      if (isDragging || isResizing || isCanvasResizing) {
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
        } else if (isCanvasResizing) {
          handleCanvasResize(syntheticEvent);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsCanvasResizing(false);
      if (isDragging || isResizing) {
        savePendingUpdates();
      }
    };

    if (isDragging || isResizing || isCanvasResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, isCanvasResizing, handleMouseMove, handleResize, handleCanvasResize, savePendingUpdates]);

  const handleDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (localElements.find(el => el.id === elementId)?.type === 'text') {
      setEditingElementId(elementId);
    } else {
      setShowPopupToolbar(true);
    }
  }, [localElements]);

  const handleTextChange = useCallback((elementId: string, newContent: string) => {
    updateLocalElement(elementId, { content: newContent });
  }, [updateLocalElement]);

  const handleTextBlur = useCallback(() => {
    setEditingElementId(null);
    console.log('PowerPointEditor: Text editing ended, saving immediately');
    // Save immediately when text editing ends
    setTimeout(() => {
      savePendingUpdates();
    }, 100);
  }, [savePendingUpdates]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
      setShowPopupToolbar(false);
    }
  }, [onElementSelect]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Canvas right-click menu could show "Add Element" options
    console.log('Canvas context menu at:', e.clientX, e.clientY);
  }, []);

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
  const selectedElement = selectedElementId ? currentElements.find(el => el.id === selectedElementId) : null;

  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="relative">
        <div
          ref={canvasRef}
          className={`relative bg-white shadow-lg overflow-hidden cursor-default focus:outline-none ${
            showBorder ? 'border-4 border-blue-500' : 'border-2 border-gray-300'
          }`}
          style={{ width: cardWidth, height: cardHeight }}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          tabIndex={0}
        >
          {/* Grid overlay with precision-based sizing */}
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

          {/* Show save indicator when there are pending updates */}
          {pendingUpdates.size > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              Saving... ({pendingUpdates.size} changes)
            </div>
          )}

          {currentElements.map((element) => (
            <ElementContextMenu
              key={element.id}
              onMoveUp={() => {
                updateLocalElement(element.id, { zIndex: (element.zIndex || 0) + 1 });
              }}
              onMoveDown={() => {
                if ((element.zIndex || 0) > 0) {
                  updateLocalElement(element.id, { zIndex: (element.zIndex || 0) - 1 });
                }
              }}
              onMoveToTop={() => {
                const maxZ = Math.max(...currentElements.map(el => el.zIndex || 0));
                updateLocalElement(element.id, { zIndex: maxZ + 1 });
              }}
              onMoveToBottom={() => {
                updateLocalElement(element.id, { zIndex: 0 });
              }}
              onDuplicate={() => {
                const newElement: CanvasElement = {
                  ...element,
                  id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  x: element.x + 20,
                  y: element.y + 20,
                  zIndex: (currentElements.length || 0) + 1,
                };
                
                const updatedElements = [...currentElements, newElement];
                setLocalElements(updatedElements);
                onUpdateElement(newElement.id, newElement);
                onElementSelect(newElement.id);
              }}
              onDelete={() => onDeleteElement(element.id)}
              onRotate={() => {
                const newRotation = ((element.rotation || 0) + 90) % 360;
                updateLocalElement(element.id, { rotation: newRotation });
              }}
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
                {/* Element rendering logic with fixed textAlign */}
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
                        textAlign: (element.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
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
                        textAlign: (element.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
                      }}
                    >
                      {element.hyperlink ? (
                        <a 
                          href={element.hyperlink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {element.content || 'Double-click to edit'}
                        </a>
                      ) : (
                        element.content || 'Double-click to edit'
                      )}
                    </div>
                  )
                ) : element.type === 'image' ? (
                  element.hyperlink ? (
                    <a href={element.hyperlink} target="_blank" rel="noopener noreferrer">
                      <img
                        src={element.imageUrl || element.content || '/placeholder.svg'}
                        alt="Card element"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </a>
                  ) : (
                    <img
                      src={element.imageUrl || element.content || '/placeholder.svg'}
                      alt="Card element"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  )
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
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onElementSelect(element.id);
                      setIsResizing(true);
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        setDragStart({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
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
                <p className="text-xs mt-1">Press Delete to remove, Ctrl+C to copy, Ctrl+V to paste, Ctrl+S to save, Space for options</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas resize handle */}
        {onCanvasSizeChange && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-75 hover:opacity-100"
            onMouseDown={handleCanvasResizeStart}
            title="Drag to resize canvas"
          />
        )}

        {/* Element Popup Toolbar */}
        {showPopupToolbar && selectedElement && (
          <div className="absolute" style={{ 
            top: selectedElement.y - 10, 
            left: selectedElement.x,
            zIndex: 1000 
          }}>
            <ElementPopupToolbar
              element={selectedElement}
              onUpdate={(updates) => {
                updateLocalElement(selectedElement.id, updates);
                savePendingUpdates();
              }}
              onClose={() => setShowPopupToolbar(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
