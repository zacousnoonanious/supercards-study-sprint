
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer } from '../InteractiveElements';
import { FillInBlankEditor } from '../FillInBlankEditor';
import { FillInBlankRenderer } from '../FillInBlankRenderer';

interface InteractiveElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
}

export const InteractiveElementRenderer: React.FC<InteractiveElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
}) => {
  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  const handleMultipleChoiceUpdate = (updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  };

  switch (element.type) {
    case 'multiple-choice':
      return (
        <div className="w-full h-full">
          <MultipleChoiceRenderer 
            element={element} 
            isEditing={!isStudyMode} 
            onUpdate={handleMultipleChoiceUpdate}
            textScale={textScale}
          />
        </div>
      );
    case 'true-false':
      return (
        <div className="w-full h-full">
          <TrueFalseRenderer 
            element={element} 
            isEditing={!isStudyMode} 
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            textScale={textScale}
          />
        </div>
      );
    case 'fill-in-blank':
      return (
        <div 
          className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
          onClick={handleElementClick}
        >
          {isStudyMode ? (
            <FillInBlankRenderer
              element={element}
              textScale={textScale}
            />
          ) : (
            <FillInBlankEditor
              element={element}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
              textScale={textScale}
            />
          )}
        </div>
      );
    default:
      return null;
  }
};
