
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { RichTextEditor } from '../RichTextEditor';

interface TextElementRendererProps {
  element: CanvasElement;
  editingElement: string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
  textScale?: number;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isSelected?: boolean;
  isDarkTheme: boolean;
}

export const TextElementRenderer: React.FC<TextElementRendererProps> = ({
  element,
  editingElement,
  onUpdateElement,
  onEditingChange,
  textScale = 1,
  isStudyMode = false,
  onElementSelect,
  isSelected = false,
  isDarkTheme,
}) => {
  const getTextColor = () => {
    return element.color || (isDarkTheme ? '#ffffff' : '#000000');
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  const textContent = (
    <div 
      className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
      onClick={handleElementClick}
    >
      <RichTextEditor
        element={{
          ...element,
          color: getTextColor()
        }}
        onUpdate={(updates) => onUpdateElement(element.id, updates)}
        onEditingChange={(editing) => onEditingChange(editing ? element.id : null)}
        textScale={textScale}
        isSelected={isSelected}
      />
    </div>
  );

  return element.hyperlink ? (
    <a 
      href={element.hyperlink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full h-full block"
      onClick={(e) => e.stopPropagation()}
    >
      {textContent}
    </a>
  ) : (
    textContent
  );
};
