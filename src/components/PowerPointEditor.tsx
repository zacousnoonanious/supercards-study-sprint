
import React, { useRef, useEffect, useState } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface PowerPointEditorProps {
  elements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onAddElement: (type: string) => void;
  onDeleteElement: (id: string) => void;
  cardWidth: number;
  cardHeight: number;
  selectedElementId?: string | null;
  onElementSelect?: (id: string | null) => void;
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
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number };
    elementId: string;
  } | null>(null);
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    resizeStart: { x: number; y: number };
    elementStart: { width: number; height: number; x: number; y: number };
    elementId: string;
    handle: string;
  } | null>(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  // Handle mouse events for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onElementSelect?.(elementId);
    
    if (handle) {
      // Start resizing
      setResizeState({
        isResizing: true,
        resizeStart: { x: e.clientX, y: e.clientY },
        elementStart: { 
          width: element.width, 
          height: element.height,
          x: element.x,
          y: element.y
        },
        elementId,
        handle
      });
    } else {
      // Start dragging
      setDragState({
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
        elementStart: { x: element.x, y: element.y },
        elementId
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragState?.isDragging) {
      const deltaX = e.clientX - dragState.dragStart.x;
      const deltaY = e.clientY - dragState.dragStart.y;
      
      const newX = Math.max(0, Math.min(dragState.elementStart.x + deltaX, cardWidth - 50));
      const newY = Math.max(0, Math.min(dragState.elementStart.y + deltaY, cardHeight - 30));
      
      onUpdateElement(dragState.elementId, { x: newX, y: newY });
    }
    
    if (resizeState?.isResizing) {
      const deltaX = e.clientX - resizeState.resizeStart.x;
      const deltaY = e.clientY - resizeState.resizeStart.y;
      
      let newWidth = resizeState.elementStart.width;
      let newHeight = resizeState.elementStart.height;
      let newX = resizeState.elementStart.x;
      let newY = resizeState.elementStart.y;
      
      const handle = resizeState.handle;
      
      if (handle.includes('e')) {
        newWidth = Math.max(50, resizeState.elementStart.width + deltaX);
      }
      if (handle.includes('w')) {
        newWidth = Math.max(50, resizeState.elementStart.width - deltaX);
        newX = resizeState.elementStart.x + deltaX;
      }
      if (handle.includes('s')) {
        newHeight = Math.max(30, resizeState.elementStart.height + deltaY);
      }
      if (handle.includes('n')) {
        newHeight = Math.max(30, resizeState.elementStart.height - deltaY);
        newY = resizeState.elementStart.y + deltaY;
      }
      
      onUpdateElement(resizeState.elementId, { 
        width: newWidth, 
        height: newHeight,
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
    setResizeState(null);
  };

  const handleDoubleClick = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDoubleClick(true);
    setEditingElementId(elementId);
    
    // Reset double click flag after a short delay
    setTimeout(() => setIsDoubleClick(false), 200);
  };

  const handleTextEdit = (elementId: string, newContent: string) => {
    onUpdateElement(elementId, { content: newContent });
    setEditingElementId(null);
  };

  useEffect(() => {
    if (dragState?.isDragging || resizeState?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      }
      if (e.key === 'Escape') {
        setEditingElementId(null);
        onElementSelect?.(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, onDeleteElement, onElementSelect]);

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElementId === element.id;
    const isEditing = editingElementId === element.id;
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move border-2 ${
          isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-transparent hover:border-gray-300'
        } ${isEditing ? 'cursor-text' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation || 0}deg)`,
          zIndex: element.zIndex || 1,
        }}
        onClick={(e) => {
          if (!isDoubleClick) {
            e.stopPropagation();
            onElementSelect?.(element.id);
          }
        }}
        onDoubleClick={(e) => element.type === 'text' && handleDoubleClick(e, element.id)}
        onMouseDown={(e) => !isEditing && handleMouseDown(e, element.id)}
      >
        {/* Element content based on type */}
        {element.type === 'text' && (
          <div
            className="w-full h-full flex items-center justify-center bg-white/90 rounded shadow-sm border"
            style={{
              fontSize: element.fontSize || 16,
              color: element.color || '#000000',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              textAlign: element.textAlign || 'center',
              padding: '8px',
            }}
          >
            {isEditing ? (
              <textarea
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                style={{
                  fontSize: element.fontSize || 16,
                  color: element.color || '#000000',
                  fontWeight: element.fontWeight || 'normal',
                  fontStyle: element.fontStyle || 'normal',
                  textAlign: element.textAlign || 'center',
                }}
                defaultValue={element.content || 'Text'}
                onBlur={(e) => handleTextEdit(element.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextEdit(element.id, e.currentTarget.value);
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="whitespace-pre-wrap">{element.content || 'Double-click to edit'}</span>
            )}
          </div>
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full bg-gray-100 rounded shadow-sm border flex items-center justify-center">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt="Element"
                className="w-full h-full object-cover rounded"
                draggable={false}
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🖼️</div>
                <span className="text-sm">Click to add image</span>
              </div>
            )}
          </div>
        )}
        
        {element.type === 'multiple-choice' && (
          <div className="w-full h-full bg-blue-50 rounded shadow-sm border p-4 overflow-auto">
            <div className="text-sm font-medium mb-2">{element.content || 'What is your question?'}</div>
            {element.multipleChoiceOptions?.map((option, index) => (
              <div key={index} className="text-xs mb-1 flex items-center">
                <span className={`mr-2 px-1 rounded text-white text-xs ${
                  element.correctAnswer === index ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            ))}
          </div>
        )}
        
        {element.type === 'true-false' && (
          <div className="w-full h-full bg-green-50 rounded shadow-sm border p-4 flex flex-col items-center justify-center">
            <div className="text-sm font-medium mb-2 text-center">{element.content || 'True or False statement'}</div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                element.correctAnswer === 0 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                True
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                element.correctAnswer === 1 ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}>
                False
              </span>
            </div>
          </div>
        )}
        
        {element.type === 'fill-in-blank' && (
          <div className="w-full h-full bg-yellow-50 rounded shadow-sm border p-4">
            <div className="text-sm font-medium mb-2">Fill in the Blank</div>
            <div className="text-xs">
              {element.content || 'The capital of France is _____.'}
            </div>
          </div>
        )}
        
        {element.type === 'drawing' && (
          <div className="w-full h-full bg-gray-50 rounded shadow-sm border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">✏️</div>
              <span className="text-sm">Drawing Canvas</span>
            </div>
          </div>
        )}
        
        {element.type === 'youtube' && (
          <div className="w-full h-full bg-red-50 rounded shadow-sm border flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">📺</div>
              <span className="text-sm">YouTube Video</span>
              {element.youtubeUrl && (
                <div className="text-xs mt-1 truncate max-w-full">
                  {element.youtubeUrl}
                </div>
              )}
            </div>
          </div>
        )}

        {element.type === 'audio' && (
          <div className="w-full h-full bg-purple-50 rounded shadow-sm border flex items-center justify-center">
            <div className="text-center text-purple-600">
              <div className="text-4xl mb-2">🎵</div>
              <span className="text-sm">Audio Player</span>
            </div>
          </div>
        )}

        {element.type === 'deck-embed' && (
          <div className="w-full h-full bg-indigo-50 rounded shadow-sm border flex items-center justify-center">
            <div className="text-center text-indigo-600">
              <div className="text-4xl mb-2">📚</div>
              <span className="text-sm">Embedded Deck</span>
            </div>
          </div>
        )}

        {/* Resize handles for selected element */}
        {isSelected && !isEditing && (
          <>
            {/* Corner resize handles */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
            />
            
            {/* Edge resize handles */}
            <div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'n')}
            />
            <div
              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'e')}
            />
            <div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 's')}
            />
            <div
              className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-w-resize rounded-sm border border-white shadow"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'w')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-white shadow-lg border-2 border-gray-300 overflow-hidden rounded-lg">
      <div
        ref={canvasRef}
        className="relative bg-white"
        style={{ width: cardWidth, height: cardHeight }}
        onClick={() => onElementSelect?.(null)}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Render all elements */}
        {elements.map(renderElement)}
        
        {/* Drop zone indicator when no elements */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <div>Click the toolbar buttons above to add elements</div>
              <div className="text-sm mt-2">Or double-click here to add text</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
