
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface FillInBlankRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  return (
    <div className={`w-full h-full p-2 bg-white border rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="text-sm">
        {element.fillInBlankText || 'Fill in the blank: The quick _____ fox jumps over the lazy dog.'}
      </div>
    </div>
  );
};
