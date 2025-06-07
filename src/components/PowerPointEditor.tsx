
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';

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
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [doubleClickToAdd, setDoubleClickToAdd] = useState(false);
  
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
    
    const newX = Math.max(0, Math.min(element.x + deltaX, cardWidth - element.width));
    const newY = Math.max(0, Math.min(element.y + deltaY, cardHeight - element.height));
    
    // Update local state immediately for smooth dragging
    updateLocalElement(selectedElementId, { x: newX, y: newY });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isDragging, selectedElementId, dragStart, localElements, cardWidth, cardHeight, updateLocalElement]);

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
    
    const newWidth = Math.max(50, Math.min(element.width + deltaX, cardWidth - element.x));
    const newHeight = Math.max(30, Math.min(element.height + deltaY, cardHeight - element.y));
    
    // Update local state immediately for smooth resizing
    updateLocalElement(selectedElementId, { width: newWidth, height: newHeight });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isResizing, selectedElementId, dragStart, localElements, cardWidth, cardHeight, updateLocalElement]);

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

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (doubleClickToAdd) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        onAddElement('text');
      }
    }
  }, [doubleClickToAdd, onAddElement]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElementId) {
      onDeleteElement(selectedElementId);
    }
  }, [selectedElementId, onDeleteElement]);

  // Use local elements for rendering
  const currentElements = localElements;

  return (
    <div className="flex-1 flex justify-center items-center p-4">
      <div className="relative">
        <div
          ref={canvasRef}
          className="relative border-2 border-gray-300 bg-white shadow-lg overflow-hidden cursor-default"
          style={{ width: cardWidth, height: cardHeight }}
          onDoubleClick={handleCanvasDoubleClick}
          onClick={handleCanvasClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20px 20px, #000 1px, transparent 0),
                  radial-gradient(circle at 0 0, #000 1px, transparent 0)
                `,
                backgroundSize: `20px 20px`,
              }}
            />
          )}

          {currentElements.map((element) => (
            <div
              key={element.id}
              className={`absolute select-none cursor-move ${
                selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                zIndex: element.zIndex || 0,
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDoubleClick={(e) => handleDoubleClick(e, element.id)}
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
                <MultipleChoiceRenderer element={element} />
              ) : element.type === 'true-false' ? (
                <TrueFalseRenderer element={element} />
              ) : element.type === 'youtube' ? (
                <YouTubeRenderer element={element} />
              ) : element.type === 'deck-embed' ? (
                <DeckEmbedRenderer element={element} />
              ) : null}

              {selectedElementId === element.id && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, element.id)}
                />
              )}
            </div>
          ))}

          {currentElements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
              <div className="text-center">
                <p>No elements yet</p>
                <p className="text-sm mt-2">Use the toolbar above to add elements</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
