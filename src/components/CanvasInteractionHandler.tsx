
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface CanvasInteractionHandlerProps {
  selectedElement: string | null;
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
  dragState,
  onMouseDown,
  isDrawingMode,
}) => {
  // Show resize handles when an element is selected (not just during dragging)
  if (!selectedElement || isDrawingMode) return null;

  return (
    <>
      {['nw', 'ne', 'sw', 'se'].map((handle) => (
        <div
          key={handle}
          className={`absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-${
            handle === 'nw' || handle === 'se' ? 'nw' : 'ne'
          }-resize z-50`}
          style={{
            top: handle.includes('n') ? -6 : 'auto',
            bottom: handle.includes('s') ? -6 : 'auto',
            left: handle.includes('w') ? -6 : 'auto',
            right: handle.includes('e') ? -6 : 'auto',
          }}
          onMouseDown={(e) => onMouseDown(e, selectedElement, 'resize', handle)}
        />
      ))}
    </>
  );
};
