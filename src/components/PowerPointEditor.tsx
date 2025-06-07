
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
    elementStart: { width: number; height: number };
    elementId: string;
    handle: string;
  } | null>(null);

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
        elementStart: { width: element.width, height: element.height },
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
      
      const newX = Math.max(0, Math.min(dragState.elementStart.x + deltaX, cardWidth - 100));
      const newY = Math.max(0, Math.min(dragState.elementStart.y + deltaY, cardHeight - 60 - 50)); // Account for footer
      
      onUpdateElement(dragState.elementId, { x: newX, y: newY });
    }
    
    if (resizeState?.isResizing) {
      const deltaX = e.clientX - resizeState.resizeStart.x;
      const deltaY = e.clientY - resizeState.resizeStart.y;
      
      let newWidth = resizeState.elementStart.width;
      let newHeight = resizeState.elementStart.height;
      
      if (resizeState.handle.includes('e')) {
        newWidth = Math.max(50, resizeState.elementStart.width + deltaX);
      }
      if (resizeState.handle.includes('s')) {
        newHeight = Math.max(30, resizeState.elementStart.height + deltaY);
      }
      
      onUpdateElement(resizeState.elementId, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
    setResizeState(null);
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, onDeleteElement]);

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElementId === element.id;
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move border-2 ${
          isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
        }`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation || 0}deg)`,
          zIndex: element.zIndex || 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onElementSelect?.(element.id);
        }}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
      >
        {/* Element content based on type */}
        {element.type === 'text' && (
          <div
            className="w-full h-full flex items-center justify-center bg-white rounded shadow-sm"
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
            {element.content || 'Text'}
          </div>
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full bg-gray-100 rounded shadow-sm flex items-center justify-center">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt="Element"
                className="w-full h-full object-cover rounded"
                draggable={false}
              />
            ) : (
              <span className="text-gray-500 text-sm">Image</span>
            )}
          </div>
        )}
        
        {element.type === 'multiple-choice' && (
          <div className="w-full h-full bg-blue-50 rounded shadow-sm p-4">
            <div className="text-sm font-medium mb-2">{element.content || 'Question'}</div>
            {element.multipleChoiceOptions?.slice(0, 2).map((option, index) => (
              <div key={index} className="text-xs mb-1">
                {String.fromCharCode(65 + index)}. {option}
              </div>
            ))}
          </div>
        )}
        
        {element.type === 'drawing' && (
          <div className="w-full h-full bg-gray-50 rounded shadow-sm flex items-center justify-center">
            <span className="text-gray-500 text-sm">Drawing Canvas</span>
          </div>
        )}
        
        {element.type === 'youtube' && (
          <div className="w-full h-full bg-red-50 rounded shadow-sm flex items-center justify-center">
            <span className="text-red-600 text-sm">YouTube Video</span>
          </div>
        )}

        {/* Resize handles for selected element */}
        {isSelected && (
          <>
            {/* Corner resize handles */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
            />
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
            />
            
            {/* Edge resize handles */}
            <div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'n')}
            />
            <div
              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'e')}
            />
            <div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 's')}
            />
            <div
              className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-w-resize"
              onMouseDown={(e) => handleMouseDown(e, element.id, 'w')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-white shadow-lg border-2 border-gray-300 overflow-hidden">
      <div
        ref={canvasRef}
        className="relative"
        style={{ width: cardWidth, height: cardHeight }}
        onClick={() => onElementSelect?.(null)}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-10"
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
      </div>
    </div>
  );
};
