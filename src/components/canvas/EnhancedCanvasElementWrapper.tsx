
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from '../CanvasElementRenderer';
import { CanvasResizeHandles } from './CanvasResizeHandles';
import { LayoutConstraints } from './LayoutConstraints';

interface EnhancedCanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  editingElement: string | null;
  zoom: number;
  availableElements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  onMouseDown: (e: React.MouseEvent, elementId: string, action?: 'drag' | 'resize', handle?: string) => void;
  onClick: (e: React.MouseEvent, elementId: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
  onDuplicate: (element: CanvasElement) => void;
  onDelete: (elementId: string) => void;
  onApplyConstraints: (elementId: string) => void;
}

export const EnhancedCanvasElementWrapper: React.FC<EnhancedCanvasElementWrapperProps> = ({
  element,
  isSelected,
  isDragging,
  editingElement,
  zoom,
  availableElements,
  canvasWidth,
  canvasHeight,
  onMouseDown,
  onClick,
  onUpdateElement,
  onEditingChange,
  onDuplicate,
  onDelete,
  onApplyConstraints,
}) => {
  const [showLayoutConstraints, setShowLayoutConstraints] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text') {
      onEditingChange(element.id);
    }
  };

  const handleLayoutConstraintsUpdate = (constraints: any[]) => {
    onUpdateElement(element.id, { layoutConstraints: constraints } as any);
  };

  const handleApplyConstraints = () => {
    onApplyConstraints(element.id);
  };

  const toggleLayoutConstraints = () => {
    setShowLayoutConstraints(!showLayoutConstraints);
  };

  // Close constraints panel when element is no longer selected
  useEffect(() => {
    if (!isSelected) {
      setShowLayoutConstraints(false);
    }
  }, [isSelected]);

  return (
    <>
      <div
        ref={elementRef}
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
        onDoubleClick={handleDoubleClick}
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

        {/* Layout constraints indicator */}
        {isSelected && (element as any).layoutConstraints?.length > 0 && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">⚓</span>
          </div>
        )}

        {/* Layout constraints button - only show when selected */}
        {isSelected && editingElement !== element.id && (
          <div className="absolute -top-8 -right-8">
            <LayoutConstraints
              element={element}
              onUpdateConstraints={handleLayoutConstraintsUpdate}
              availableElements={availableElements}
              isVisible={showLayoutConstraints}
              onToggle={toggleLayoutConstraints}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onApplyConstraints={handleApplyConstraints}
            />
          </div>
        )}
      </div>
    </>
  );
};
