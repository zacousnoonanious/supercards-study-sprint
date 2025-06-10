
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from '../CanvasElementRenderer';
import { CanvasResizeHandles } from './CanvasResizeHandles';

interface CanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  editingElement: string | null;
  zoom: number;
  onMouseDown: (e: React.MouseEvent, elementId: string, action?: 'drag' | 'resize', handle?: string) => void;
  onClick: (e: React.MouseEvent, elementId: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
}

export const CanvasElementWrapper: React.FC<CanvasElementWrapperProps> = ({
  element,
  isSelected,
  isDragging,
  editingElement,
  zoom,
  onMouseDown,
  onClick,
  onUpdateElement,
  onEditingChange,
}) => {
  return (
    <div
      className={`absolute select-none ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center',
        zIndex: element.zIndex || 0,
        cursor: isDragging ? 'grabbing' : 
               editingElement === element.id ? 'text' : 'grab',
      }}
      onMouseDown={(e) => onMouseDown(e, element.id)}
      onClick={(e) => onClick(e, element.id)}
      data-element="true"
    >
      <CanvasElementRenderer
        element={element}
        editingElement={editingElement}
        onUpdateElement={onUpdateElement}
        onEditingChange={onEditingChange}
        zoom={zoom}
        onElementDragStart={(e, elementId) => onMouseDown(e, elementId)}
        isDragging={isDragging}
        isSelected={isSelected}
      />
      
      {/* Resize handles for selected element */}
      {isSelected && editingElement !== element.id && (
        <CanvasResizeHandles
          elementId={element.id}
          onResizeStart={onMouseDown}
        />
      )}
    </div>
  );
};
