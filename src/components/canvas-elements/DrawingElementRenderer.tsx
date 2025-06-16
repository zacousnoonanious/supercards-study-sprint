
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface DrawingElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const DrawingElementRenderer: React.FC<DrawingElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  return (
    <div className={`w-full h-full border rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <canvas
        className="w-full h-full"
        style={{
          background: element.backgroundColor || 'transparent',
        }}
      />
    </div>
  );
};
