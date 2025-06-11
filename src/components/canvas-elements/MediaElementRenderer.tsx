
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { YouTubeElementEditor } from '../YouTubeElementEditor';
import { EmbeddedDeckViewer } from '../EmbeddedDeckViewer';
import { EnhancedDrawingCanvas } from '../EnhancedDrawingCanvas';

interface MediaElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme: boolean;
  isSelected?: boolean;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
}

export const MediaElementRenderer: React.FC<MediaElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
  isDarkTheme,
  isSelected = false,
  onElementDragStart,
  isDragging = false,
}) => {
  const handleElementClick = () => {
    onElementSelect?.(element.id);
  };

  switch (element.type) {
    case 'youtube':
      return (
        <div 
          className="w-full h-full"
          onClick={handleElementClick}
        >
          <YouTubeElementEditor
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            textScale={textScale}
          />
        </div>
      );

    case 'deck-embed':
      return (
        <div 
          className="w-full h-full"
          onClick={handleElementClick}
        >
          <EmbeddedDeckViewer
            deckId={element.deckId || ''}
            width={element.width}
            height={element.height}
          />
        </div>
      );

    case 'drawing':
      return (
        <div 
          className="w-full h-full"
          onClick={handleElementClick}
        >
          <EnhancedDrawingCanvas
            width={element.width}
            height={element.height}
            onDrawingComplete={(drawingData) => onUpdateElement(element.id, { drawingData })}
            initialDrawing={element.drawingData}
            strokeColor={element.strokeColor || '#000000'}
            strokeWidth={element.strokeWidth || 2}
            opacity={element.opacity || 1}
            highlightMode={element.highlightMode || false}
            onDragStart={(e) => onElementDragStart?.(e, element.id)}
            isDragging={isDragging}
            isActive={isSelected}
            onActivate={() => onElementSelect?.(element.id)}
          />
        </div>
      );

    default:
      return null;
  }
};
