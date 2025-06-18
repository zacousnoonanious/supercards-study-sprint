
import React, { memo } from 'react';
import { TextElementRenderer } from './canvas-elements/TextElementRenderer';
import { ImageElementRenderer } from './canvas-elements/ImageElementRenderer';
import { AudioElementRenderer } from './canvas-elements/AudioElementRenderer';
import { MultipleChoiceRenderer } from './canvas-elements/MultipleChoiceRenderer';
import { TrueFalseRenderer } from './canvas-elements/TrueFalseRenderer';
import { FillInBlankRenderer } from './canvas-elements/FillInBlankRenderer';
import { YouTubeElementRenderer } from './canvas-elements/YouTubeElementRenderer';
import { DrawingElementRenderer } from './canvas-elements/DrawingElementRenderer';
import { MediaElementRenderer } from './canvas-elements/MediaElementRenderer';
import { CanvasElement } from '@/types/flashcard';

export interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected?: boolean;
  zoom?: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
  onEditingChange?: (id: string | null) => void;
  editingElement?: string | null;
  textScale?: number;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme?: boolean;
  onElementLink?: (elementId: string, linkData: any) => void;
  onLaunchEmbeddedDeck?: (deckId: string) => void;
}

// Memoize the component to prevent unnecessary re-renders
export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = memo(({
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
  onElementLink,
  onLaunchEmbeddedDeck,
}) => {
  console.log('🔧 CanvasElementRenderer render for element:', element.id, element.type);

  // Add error boundary logic
  try {
    switch (element.type) {
      case 'text':
        return (
          <TextElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
            onElementDragStart={onElementDragStart}
            isDragging={isDragging}
            onEditingChange={onEditingChange}
            editingElement={editingElement}
            textScale={textScale}
            isStudyMode={isStudyMode}
            onElementSelect={onElementSelect}
            isDarkTheme={isDarkTheme}
          />
        );
      case 'image':
        return (
          <ImageElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
            onElementDragStart={onElementDragStart}
            isDragging={isDragging}
            textScale={textScale}
            isStudyMode={isStudyMode}
            onElementSelect={onElementSelect}
            isDarkTheme={isDarkTheme}
          />
        );
      case 'audio':
        return (
          <AudioElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
            textScale={textScale}
            isStudyMode={isStudyMode}
            onElementSelect={onElementSelect}
            isDarkTheme={isDarkTheme}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
          />
        );
      case 'true-false':
        return (
          <TrueFalseRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
          />
        );
      case 'fill-in-blank':
        return (
          <FillInBlankRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
          />
        );
      case 'youtube':
        return (
          <YouTubeElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
          />
        );
      case 'drawing':
        return (
          <DrawingElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
            onElementDragStart={onElementDragStart}
            isDragging={isDragging}
          />
        );
      case 'video':
      case 'iframe':
      case 'embedded-deck':
      case 'deck-embed':
        return (
          <MediaElementRenderer
            element={element}
            isSelected={isSelected}
            zoom={zoom}
            onUpdateElement={onUpdateElement}
          />
        );
      case 'tts':
        return null;
      default:
        console.warn('🔧 Unknown element type:', element.type);
        return (
          <div className="border-2 border-red-500 p-2 text-red-600">
            Unknown element type: {element.type}
          </div>
        );
    }
  } catch (error) {
    console.error('🔧 Error rendering element:', element.id, error);
    return (
      <div className="border-2 border-red-500 p-2 text-red-600">
        Error rendering {element.type} element
      </div>
    );
  }
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.editingElement === nextProps.editingElement &&
    prevProps.zoom === nextProps.zoom &&
    JSON.stringify(prevProps.element) === JSON.stringify(nextProps.element)
  );
});

CanvasElementRenderer.displayName = 'CanvasElementRenderer';
