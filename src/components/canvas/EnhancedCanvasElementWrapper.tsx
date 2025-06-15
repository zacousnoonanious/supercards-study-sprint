
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from '../CanvasElementRenderer';
import { CanvasResizeHandles } from './CanvasResizeHandles';
import { ContextAwareToolbar } from './ContextAwareToolbar';
import { LayoutConstraints } from './LayoutConstraints';

interface EnhancedCanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  editingElement: string | null;
  zoom: number;
  availableElements: CanvasElement[];
  onMouseDown: (e: React.MouseEvent, elementId: string, action?: 'drag' | 'resize', handle?: string) => void;
  onClick: (e: React.MouseEvent, elementId: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
  onDuplicate: (element: CanvasElement) => void;
  onDelete: (elementId: string) => void;
}

export const EnhancedCanvasElementWrapper: React.FC<EnhancedCanvasElementWrapperProps> = ({
  element,
  isSelected,
  isDragging,
  editingElement,
  zoom,
  availableElements,
  onMouseDown,
  onClick,
  onUpdateElement,
  onEditingChange,
  onDuplicate,
  onDelete,
}) => {
  const [showContextToolbar, setShowContextToolbar] = useState(false);
  const [showLayoutConstraints, setShowLayoutConstraints] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (isSelected && !isDragging && editingElement !== element.id) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => {
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect();
          setToolbarPosition({
            x: element.x,
            y: element.y,
          });
          setShowContextToolbar(true);
        }
      }, 500); // Show toolbar after 500ms hover
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    // Don't hide immediately to allow interaction with toolbar
    setTimeout(() => {
      setShowContextToolbar(false);
    }, 200);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text') {
      onEditingChange(element.id);
    } else {
      setShowContextToolbar(true);
    }
  };

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  };

  const handleDuplicate = () => {
    onDuplicate(element);
    setShowContextToolbar(false);
  };

  const handleDeleteElement = () => {
    onDelete(element.id);
    setShowContextToolbar(false);
  };

  const handleLayoutConstraintsUpdate = (constraints: any[]) => {
    onUpdateElement(element.id, { layoutConstraints: constraints } as any);
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeout.current);
    };
  }, []);

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
      </div>

      {/* Context-aware toolbar */}
      {showContextToolbar && isSelected && (
        <ContextAwareToolbar
          element={element}
          onUpdate={handleUpdate}
          onDelete={handleDeleteElement}
          onDuplicate={handleDuplicate}
          position={toolbarPosition}
          onClose={() => setShowContextToolbar(false)}
        />
      )}

      {/* Layout constraints panel */}
      {isSelected && (
        <div className="absolute" style={{ left: element.x + element.width + 10, top: element.y }}>
          <LayoutConstraints
            element={element}
            onUpdateConstraints={handleLayoutConstraintsUpdate}
            availableElements={availableElements}
            isVisible={showLayoutConstraints}
            onToggle={() => setShowLayoutConstraints(!showLayoutConstraints)}
          />
        </div>
      )}
    </>
  );
};
