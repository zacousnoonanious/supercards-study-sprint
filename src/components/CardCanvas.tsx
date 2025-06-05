
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
}

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: any) => void;
  cardSide: 'front' | 'back';
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
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

  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onSelectElement(elementId);
    
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
      onUpdateElement(selectedElement, {
        x: Math.max(0, dragState.elementStart.x + deltaX),
        y: Math.max(0, dragState.elementStart.y + deltaY)
      });
    } else if (dragState.isResizing && dragState.resizeHandle) {
      const updates: any = {};
      
      switch (dragState.resizeHandle) {
        case 'se': // Southeast corner
          updates.width = Math.max(20, dragState.elementStart.width + deltaX);
          updates.height = Math.max(20, dragState.elementStart.height + deltaY);
          break;
        case 'sw': // Southwest corner
          updates.width = Math.max(20, dragState.elementStart.width - deltaX);
          updates.height = Math.max(20, dragState.elementStart.height + deltaY);
          updates.x = dragState.elementStart.x + deltaX;
          break;
        case 'ne': // Northeast corner
          updates.width = Math.max(20, dragState.elementStart.width + deltaX);
          updates.height = Math.max(20, dragState.elementStart.height - deltaY);
          updates.y = dragState.elementStart.y + deltaY;
          break;
        case 'nw': // Northwest corner
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
            {/* Element content */}
            {element.type === 'text' ? (
              <div
                className="w-full h-full flex items-center justify-center p-2 bg-white border border-gray-300 rounded overflow-hidden"
                style={{
                  fontSize: element.fontSize,
                  color: element.color,
                }}
              >
                {element.content}
              </div>
            ) : (
              <img
                src={element.imageUrl}
                alt="Element"
                className="w-full h-full object-cover border border-gray-300 rounded"
                draggable={false}
              />
            )}

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
      </div>
    </Card>
  );
};
