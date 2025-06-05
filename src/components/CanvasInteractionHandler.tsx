
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface CanvasInteractionHandlerProps {
  selectedElement: string | null;
  selectedElementData: CanvasElement | null;
  dragState: {
    isDragging: boolean;
    isResizing: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number; width: number; height: number };
    resizeHandle?: string;
  } | null;
  onMouseDown: (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', resizeHandle?: string) => void;
  isDrawingMode: boolean;
}

export const CanvasInteractionHandler: React.FC<CanvasInteractionHandlerProps> = ({
  selectedElement,
  selectedElementData,
  dragState,
  onMouseDown,
  isDrawingMode,
}) => {
  // Show resize handles when an element is selected (not just during dragging)
  if (!selectedElement || !selectedElementData || isDrawingMode) return null;

  const handleSize = 8; // Size of the resize handles
  const halfHandle = handleSize / 2;

  return (
    <>
      {/* Corner resize handles */}
      {['nw', 'ne', 'sw', 'se'].map((handle) => (
        <div
          key={handle}
          className={`absolute bg-blue-500 border border-white rounded-sm cursor-${
            handle === 'nw' || handle === 'se' ? 'nw' : 'ne'
          }-resize z-50 hover:bg-blue-600 transition-colors`}
          style={{
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            left: selectedElementData.x + (handle.includes('w') ? -halfHandle : handle.includes('e') ? selectedElementData.width - halfHandle : selectedElementData.width / 2 - halfHandle),
            top: selectedElementData.y + (handle.includes('n') ? -halfHandle : handle.includes('s') ? selectedElementData.height - halfHandle : selectedElementData.height / 2 - halfHandle),
          }}
          onMouseDown={(e) => onMouseDown(e, selectedElement, 'resize', handle)}
        />
      ))}
      
      {/* Edge resize handles */}
      {['n', 's', 'e', 'w'].map((handle) => (
        <div
          key={handle}
          className={`absolute bg-blue-500 border border-white rounded-sm cursor-${
            handle === 'n' || handle === 's' ? 'ns' : 'ew'
          }-resize z-50 hover:bg-blue-600 transition-colors`}
          style={{
            width: handle === 'n' || handle === 's' ? `${handleSize}px` : `${handleSize}px`,
            height: handle === 'e' || handle === 'w' ? `${handleSize}px` : `${handleSize}px`,
            left: selectedElementData.x + (
              handle === 'w' ? -halfHandle :
              handle === 'e' ? selectedElementData.width - halfHandle :
              selectedElementData.width / 2 - halfHandle
            ),
            top: selectedElementData.y + (
              handle === 'n' ? -halfHandle :
              handle === 's' ? selectedElementData.height - halfHandle :
              selectedElementData.height / 2 - halfHandle
            ),
          }}
          onMouseDown={(e) => onMouseDown(e, selectedElement, 'resize', handle)}
        />
      ))}
    </>
  );
};
