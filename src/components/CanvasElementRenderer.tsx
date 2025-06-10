
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { SimpleTextElementRenderer } from './canvas-elements/SimpleTextElementRenderer';
import { ImageElementRenderer } from './canvas-elements/ImageElementRenderer';
import { AudioElementRenderer } from './canvas-elements/AudioElementRenderer';
import { InteractiveElementRenderer } from './canvas-elements/InteractiveElementRenderer';
import { MediaElementRenderer } from './canvas-elements/MediaElementRenderer';

interface CanvasElementRendererProps {
  element: CanvasElement;
  editingElement: string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
  textScale?: number;
  zoom?: number;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isSelected?: boolean;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  editingElement,
  onUpdateElement,
  onEditingChange,
  textScale = 1,
  zoom = 1,
  onElementDragStart,
  isDragging = false,
  isStudyMode = false,
  onElementSelect,
  isSelected = false,
}) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const commonProps = {
    element,
    textScale,
    isStudyMode,
    onUpdateElement,
    onElementSelect,
    isDarkTheme,
    isSelected,
    isEditing: editingElement === element.id,
    onEditingChange,
  };

  const containerProps = {
    className: "w-full h-full",
    style: { 
      pointerEvents: (editingElement === element.id ? 'auto' : 'none') as React.CSSProperties['pointerEvents']
    }
  };

  switch (element.type) {
    case 'text':
      return (
        <div {...containerProps}>
          <SimpleTextElementRenderer
            {...commonProps}
          />
        </div>
      );
    case 'image':
      return (
        <div {...containerProps}>
          <ImageElementRenderer
            {...commonProps}
          />
        </div>
      );
    case 'audio':
      return (
        <div {...containerProps}>
          <AudioElementRenderer
            {...commonProps}
          />
        </div>
      );
    case 'multiple-choice':
    case 'true-false':
    case 'fill-in-blank':
      return (
        <div {...containerProps}>
          <InteractiveElementRenderer
            element={element}
            textScale={textScale}
            isStudyMode={isStudyMode}
            onUpdateElement={onUpdateElement}
            onElementSelect={onElementSelect}
          />
        </div>
      );
    case 'youtube':
    case 'deck-embed':
    case 'drawing':
      return (
        <div {...containerProps}>
          <MediaElementRenderer
            {...commonProps}
            onElementDragStart={onElementDragStart}
            isDragging={isDragging}
          />
        </div>
      );
    default:
      return null;
  }
};
