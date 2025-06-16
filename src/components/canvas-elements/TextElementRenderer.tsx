
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { RichTextEditor } from '../RichTextEditor';
import { useI18n } from '@/contexts/I18nContext';

interface TextElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
  onEditingChange?: (id: string) => void;
  editingElement?: string | null;
  textScale?: number;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme?: boolean;
}

export const TextElementRenderer: React.FC<TextElementRendererProps> = ({
  element,
  isSelected = false,
  zoom = 1,
  onUpdateElement,
  onElementDragStart,
  isDragging = false,
  onEditingChange,
  editingElement = null,
  textScale = 1,
  isStudyMode = false,
  onElementSelect,
  isDarkTheme = false,
}) => {
  const { t } = useI18n();

  const getTextColor = () => {
    return element.color || (isDarkTheme ? '#ffffff' : '#000000');
  };

  const textContent = (
    <div className="w-full h-full">
      <RichTextEditor
        element={{
          ...element,
          color: getTextColor()
        }}
        onUpdate={(updates) => onUpdateElement(element.id, updates)}
        onEditingChange={(editing) => onEditingChange && onEditingChange(editing ? element.id : null)}
        textScale={textScale}
        isSelected={isSelected}
        isStudyMode={isStudyMode}
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
