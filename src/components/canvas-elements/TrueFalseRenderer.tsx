
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface TrueFalseRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const TrueFalseRenderer: React.FC<TrueFalseRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  return (
    <div className={`w-full h-full p-2 bg-white border rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="text-sm font-medium mb-2">{element.content || 'True/False Question'}</div>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name={`tf-${element.id}`}
            className="w-3 h-3"
            defaultChecked={element.correctAnswer === 1}
          />
          <span className="text-xs">True</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name={`tf-${element.id}`}
            className="w-3 h-3"
            defaultChecked={element.correctAnswer === 0}
          />
          <span className="text-xs">False</span>
        </div>
      </div>
    </div>
  );
};
