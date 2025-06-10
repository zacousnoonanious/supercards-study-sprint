
import React, { useState } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { YouTubeRenderer } from '../InteractiveElements';
import { YouTubeElementEditor } from '../YouTubeElementEditor';
import { DrawingCanvas } from '../DrawingCanvas';
import { DeckSelector } from '../DeckSelector';
import { EmbeddedDeckViewer } from '../EmbeddedDeckViewer';

interface MediaElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
  isDarkTheme: boolean;
}

export const MediaElementRenderer: React.FC<MediaElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
  onElementDragStart,
  isDragging = false,
  isDarkTheme,
}) => {
  const [activeDrawingElement, setActiveDrawingElement] = useState<string | null>(null);

  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  switch (element.type) {
    case 'youtube':
      return (
        <div 
          className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
          onClick={handleElementClick}
        >
          {isStudyMode ? (
            <YouTubeRenderer element={element} />
          ) : (
            <YouTubeElementEditor
              element={element}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
              textScale={textScale}
            />
          )}
        </div>
      );
    case 'deck-embed':
      return (
        <div className={`w-full h-full flex items-center justify-center p-2 rounded border ${
          isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } ${isStudyMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={handleElementClick}
        >
          {element.deckId ? (
            element.hyperlink ? (
              <a 
                href={element.hyperlink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-full block"
              >
                <EmbeddedDeckViewer
                  deckId={element.deckId}
                  width={element.width}
                  height={element.height}
                  textScale={textScale}
                />
              </a>
            ) : (
              <div className="w-full h-full">
                <EmbeddedDeckViewer
                  deckId={element.deckId}
                  width={element.width}
                  height={element.height}
                  textScale={textScale}
                />
                {!isStudyMode && (
                  <div className="text-center mt-2">
                    <button 
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
                      style={{ fontSize: `${10 * textScale}px` }}
                      onClick={() => onUpdateElement(element.id, { deckId: undefined, deckTitle: undefined })}
                    >
                      Change Deck
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            !isStudyMode && (
              <div className="w-full h-full">
                <DeckSelector
                  onDeckSelect={(deckId, deckTitle) => {
                    onUpdateElement(element.id, { deckId, deckTitle });
                  }}
                  currentDeckId={element.deckId}
                  textScale={textScale}
                />
              </div>
            )
          )}
        </div>
      );
    case 'drawing':
      return (
        <div 
          className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
          onClick={handleElementClick}
        >
          <DrawingCanvas
            width={element.width}
            height={element.height}
            onDrawingComplete={(drawingData) => {
              onUpdateElement(element.id, { 
                drawingData
              });
            }}
            initialDrawing={element.drawingData}
            strokeColor={element.strokeColor}
            strokeWidth={element.strokeWidth}
            onDragStart={(e) => onElementDragStart?.(e, element.id)}
            isDragging={isDragging}
            isActive={activeDrawingElement === element.id}
            onActivate={() => setActiveDrawingElement(element.id)}
            onDeactivate={() => setActiveDrawingElement(null)}
          />
        </div>
      );
    default:
      return null;
  }
};
