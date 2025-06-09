
import React, { useState } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { FillInBlankEditor } from './FillInBlankEditor';
import { FillInBlankRenderer } from './FillInBlankRenderer';
import { DrawingCanvas } from './DrawingCanvas';
import { DeckSelector } from './DeckSelector';
import { EmbeddedDeckViewer } from './EmbeddedDeckViewer';
import { RichTextEditor } from './RichTextEditor';
import { ImageElementEditor } from './ImageElementEditor';
import { YouTubeElementEditor } from './YouTubeElementEditor';
import { useTheme } from '@/contexts/ThemeContext';

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
}) => {
  const { theme } = useTheme();
  const [activeDrawingElement, setActiveDrawingElement] = useState<string | null>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Use global theme for canvas elements
  const getTextColor = () => {
    return element.color || (isDarkTheme ? '#ffffff' : '#000000');
  };

  const getBackgroundColor = () => {
    return isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  };

  const handleMultipleChoiceUpdate = (updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
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
    case 'audio':
      const audioContent = (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded border p-2 ${
          isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } ${isStudyMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={handleElementClick}
        >
          {element.audioUrl ? (
            <audio controls className="w-full max-w-full">
              <source src={element.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          ) : (
            !isStudyMode && (
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2" style={{ fontSize: `${12 * textScale}px` }}>
                  No audio file
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        onUpdateElement(element.id, { audioUrl: result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs"
                  style={{ fontSize: `${10 * textScale}px` }}
                />
              </div>
            )
          )}
        </div>
      );

      return element.hyperlink ? (
        <a 
          href={element.hyperlink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-full block"
        >
          {audioContent}
        </a>
      ) : (
        audioContent
      );
    case 'text':
      const textContent = (
        <div 
          className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
          onClick={handleElementClick}
        >
          <RichTextEditor
            element={{
              ...element,
              color: getTextColor() // Override color based on global theme
            }}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onEditingChange={(editing) => onEditingChange(editing ? element.id : null)}
            textScale={textScale}
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
    case 'image':
      return (
        <div 
          className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
          onClick={handleElementClick}
        >
          {isStudyMode ? (
            <div 
              className="w-full h-full"
              style={{
                opacity: element.opacity || 1,
                transform: `rotate(${element.rotation || 0}deg)`,
              }}
            >
              {element.imageUrl ? (
                <img
                  src={element.imageUrl}
                  alt="Element"
                  className={`w-full h-full object-cover ${
                    element.borderStyle ? `border-2 border-${element.borderColor || 'gray-300'}` : ''
                  } ${element.borderRadius ? 'rounded' : ''}`}
                  style={{
                    borderWidth: element.borderWidth || 0,
                    borderColor: element.borderColor || '#d1d5db',
                    borderStyle: element.borderStyle || 'none',
                  }}
                  draggable={false}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${getBackgroundColor()}`}>
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          ) : (
            <ImageElementEditor
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
