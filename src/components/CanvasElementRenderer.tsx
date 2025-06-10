
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';
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
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const commonProps = {
    element,
    textScale,
    isStudyMode,
    onUpdateElement,
    onElementSelect,
    isDarkTheme,
  };

  switch (element.type) {
    case 'text':
      return (
        <SimpleTextElementRenderer
          {...commonProps}
        />
      );
    case 'image':
      return (
        <ImageElementRenderer
          {...commonProps}
        />
      );
    case 'audio':
      return (
        <AudioElementRenderer
          {...commonProps}
        />
      );
    case 'multiple-choice':
    case 'true-false':
    case 'fill-in-blank':
      return (
        <InteractiveElementRenderer
          element={element}
          textScale={textScale}
          isStudyMode={isStudyMode}
          onUpdateElement={onUpdateElement}
          onElementSelect={onElementSelect}
        />
      );
    case 'youtube':
    case 'deck-embed':
    case 'drawing':
      return (
        <MediaElementRenderer
          {...commonProps}
          onElementDragStart={onElementDragStart}
          isDragging={isDragging}
        />
      );
    default:
      return null;
  }
};
