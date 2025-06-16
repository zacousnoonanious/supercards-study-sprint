
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface MultipleChoiceRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const MultipleChoiceRenderer: React.FC<MultipleChoiceRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  return (
    <div className={`w-full h-full p-2 bg-white border rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="text-sm font-medium mb-2">{element.content || 'Multiple Choice Question'}</div>
      <div className="space-y-1">
        {(element.multipleChoiceOptions || []).map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`mc-${element.id}`}
              className="w-3 h-3"
              defaultChecked={element.correctAnswer === index}
            />
            <span className="text-xs">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
