import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CanvasElement } from '@/types/flashcard';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  cardSide: 'front' | 'back';
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
}) => {
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

  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onSelectElement(elementId);
    
    // Show popup for interactive elements
    if (['multiple-choice', 'true-false', 'youtube', 'deck-embed'].includes(element.type)) {
      setShowPopupFor(elementId);
      setPopupPosition({ x: element.x + element.width, y: element.y });
    } else {
      setShowPopupFor(null);
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
      const newX = Math.max(0, dragState.elementStart.x + deltaX);
      const newY = Math.max(0, dragState.elementStart.y + deltaY);
      
      onUpdateElement(selectedElement, { x: newX, y: newY });
      
      // Update popup position if showing
      if (showPopupFor === selectedElement) {
        const element = elements.find(el => el.id === selectedElement);
        if (element) {
          setPopupPosition({ x: newX + element.width, y: newY });
        }
      }
    } else if (dragState.isResizing && dragState.resizeHandle) {
      const updates: Partial<CanvasElement> = {};
      
      switch (dragState.resizeHandle) {
        case 'se':
          updates.width = Math.max(20, dragState.elementStart.width + deltaX);
          updates.height = Math.max(20, dragState.elementStart.height + deltaY);
          break;
        case 'sw':
          updates.width = Math.max(20, dragState.elementStart.width - deltaX);
          updates.height = Math.max(20, dragState.elementStart.height + deltaY);
          updates.x = dragState.elementStart.x + deltaX;
          break;
        case 'ne':
          updates.width = Math.max(20, dragState.elementStart.width + deltaX);
          updates.height = Math.max(20, dragState.elementStart.height - deltaY);
          updates.y = dragState.elementStart.y + deltaY;
          break;
        case 'nw':
          updates.width = Math.max(20, dragState.elementStart.width - deltaX);
          updates.height = Math.max(20, dragState.elementStart.height - deltaY);
          updates.x = dragState.elementStart.x + deltaX;
          updates.y = dragState.elementStart.y + deltaY;
          break;
      }
      
      onUpdateElement(selectedElement, updates);
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
    }
  };

  const handleTextDoubleClick = (elementId: string) => {
    setEditingElement(elementId);
  };

  const handleTextClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    if (e.detail === 2) {
      const target = e.currentTarget.querySelector('input, span') as HTMLInputElement | HTMLElement;
      if (target && 'select' in target) {
        target.select();
      } else if (target) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setEditingElement(elementId);
    } else if (e.detail === 3) {
      const target = e.currentTarget.querySelector('input, span') as HTMLInputElement | HTMLElement;
      if (target && 'select' in target) {
        target.select();
      } else if (target) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setEditingElement(elementId);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent, elementId: string) => {
    if (e.key === 'Enter') {
      setEditingElement(null);
    }
  };

  const handleTextChange = (elementId: string, newContent: string) => {
    onUpdateElement(elementId, { content: newContent });
  };

  const getTextStyle = (element: CanvasElement) => ({
    fontSize: element.fontSize,
    color: element.color,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    textAlign: element.textAlign as any,
  });

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
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-2 bg-white border border-gray-300 rounded overflow-hidden cursor-text"
            style={getTextStyle(element)}
            onClick={(e) => handleTextClick(e, element.id)}
          >
            {editingElement === element.id ? (
              <input
                type="text"
                value={element.content || ''}
                onChange={(e) => handleTextChange(element.id, e.target.value)}
                onKeyDown={(e) => handleTextKeyDown(e, element.id)}
                onBlur={() => setEditingElement(null)}
                className="w-full h-full bg-transparent border-none outline-none text-center"
                style={getTextStyle(element)}
                autoFocus
              />
            ) : (
              <span 
                className="w-full h-full flex items-center justify-center"
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
            className="w-full h-full object-cover border border-gray-300 rounded"
            draggable={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="relative overflow-hidden bg-white" style={{ aspectRatio: '3/2', minHeight: '400px' }}>
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Canvas background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">
            {cardSide} side
          </div>
        </div>

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
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: 'center',
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          >
            {renderElement(element)}

            {/* Resize handles */}
            {selectedElement === element.id && (
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
        ))}

        {/* Popup Toolbar */}
        {showPopupFor && (
          <ElementPopupToolbar
            element={elements.find(el => el.id === showPopupFor)!}
            onUpdate={(updates) => onUpdateElement(showPopupFor, updates)}
            onDelete={() => {
              onDeleteElement(showPopupFor);
              setShowPopupFor(null);
            }}
            position={popupPosition}
          />
        )}
      </div>
    </Card>
  );
};
