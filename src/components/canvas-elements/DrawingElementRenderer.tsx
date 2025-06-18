
import React, { useCallback, useMemo } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface DrawingElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
}

export const DrawingElementRenderer: React.FC<DrawingElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
  onElementDragStart,
  isDragging = false,
}) => {
  // Memoize container styles to prevent re-renders
  const containerStyles = useMemo(() => ({
    opacity: element.opacity || 1,
    transform: `rotate(${element.rotation || 0}deg)`,
    background: element.backgroundColor || 'transparent',
  }), [element.opacity, element.rotation, element.backgroundColor]);

  // Stable update handler to prevent re-renders
  const handleUpdate = useCallback((updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  }, [onUpdateElement, element.id]);

  // Prevent event propagation to avoid conflicts with drag system
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  console.log('🎨 DrawingElementRenderer render for element:', element.id, { isSelected, isDragging });

  return (
    <div 
      className={`w-full h-full border rounded ${isSelected ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
      style={containerStyles}
    >
      <canvas
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'transparent',
          pointerEvents: isDragging ? 'none' : 'auto'
        }}
      />
      {!element.content && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-sm">Drawing Canvas</span>
        </div>
      )}
    </div>
  );
};
