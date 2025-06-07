
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { FillInBlankEditor } from './FillInBlankEditor';
import { DrawingCanvas } from './DrawingCanvas';
import { DeckSelector } from './DeckSelector';
import { EmbeddedDeckViewer } from './EmbeddedDeckViewer';
import { useTheme } from '@/contexts/ThemeContext';

interface CanvasElementRendererProps {
  element: CanvasElement;
  editingElement: string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
  textScale?: number;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  editingElement,
  onUpdateElement,
  onEditingChange,
  textScale = 1,
  onElementDragStart,
  isDragging = false,
}) => {
  const { theme } = useTheme();

  const handleMultipleChoiceUpdate = (updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdateElement(element.id, { imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdateElement(element.id, { audioUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  switch (element.type) {
    case 'multiple-choice':
      return (
        <div className="w-full h-full">
          <MultipleChoiceRenderer 
            element={element} 
            isEditing={true} 
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
            isEditing={true} 
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            textScale={textScale}
          />
        </div>
      );
    case 'fill-in-blank':
      return (
        <div className="w-full h-full">
          <FillInBlankEditor
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            textScale={textScale}
          />
        </div>
      );
    case 'youtube':
      const youtubeContent = (
        <div className="w-full h-full">
          <YouTubeRenderer element={element} />
        </div>
      );

      return element.hyperlink ? (
        <a 
          href={element.hyperlink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-full block"
        >
          {youtubeContent}
        </a>
      ) : (
        youtubeContent
      );
    case 'deck-embed':
      return (
        <div className={`w-full h-full flex items-center justify-center p-2 rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
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
                <div className="text-center mt-2">
                  <button 
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
                    style={{ fontSize: `${10 * textScale}px` }}
                    onClick={() => onUpdateElement(element.id, { deckId: undefined, deckTitle: undefined })}
                  >
                    Change Deck
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full">
              <DeckSelector
                onDeckSelect={(deckId, deckTitle) => {
                  onUpdateElement(element.id, { deckId, deckTitle });
                }}
                currentDeckId={element.deckId}
                textScale={textScale}
              />
            </div>
          )}
        </div>
      );
    case 'drawing':
      return (
        <div className="w-full h-full">
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
          />
        </div>
      );
    case 'audio':
      const audioContent = (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded border p-2 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          {element.audioUrl ? (
            <audio controls className="w-full max-w-full">
              <source src={element.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          ) : (
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2" style={{ fontSize: `${12 * textScale}px` }}>
                No audio file
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="text-xs"
                style={{ fontSize: `${10 * textScale}px` }}
              />
            </div>
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
        <span 
          className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words leading-tight select-text"
          style={{ 
            textAlign: element.textAlign || 'center',
            fontSize: `${Math.min((element.fontSize || 16) * textScale, element.height / 2)}px`,
            lineHeight: '1.2',
            color: element.color || (theme === 'dark' ? '#ffffff' : '#000000'),
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            textDecoration: element.textDecoration || 'none',
          }}
        >
          {element.content}
        </span>
      );

      return (
        <div
          className={`w-full h-full flex items-center justify-center border rounded overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'
          } ${editingElement === element.id ? 'cursor-text' : 'cursor-text'}`}
          style={{
            padding: '4px 8px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 2) {
              onEditingChange(element.id);
            }
          }}
        >
          {editingElement === element.id ? (
            <textarea
              value={element.content || ''}
              onChange={(e) => {
                e.stopPropagation();
                const newContent = e.target.value;
                onUpdateElement(element.id, { content: newContent });
                
                // Auto-resize text element based on content with minimal padding
                const lines = newContent.split('\n').length;
                const longestLine = Math.max(...newContent.split('\n').map(line => line.length));
                
                const fontSize = (element.fontSize || 16) * textScale;
                const newWidth = Math.max(100, Math.min(600, longestLine * fontSize * 0.6 + 16));
                const newHeight = Math.max(32, lines * fontSize * 1.2 + 16);
                
                if (newWidth !== element.width || newHeight !== element.height) {
                  onUpdateElement(element.id, { 
                    width: newWidth, 
                    height: newHeight 
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onEditingChange(null);
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onBlur={() => onEditingChange(null)}
              className={`w-full h-full bg-transparent border-none outline-none resize-none ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
              style={{
                fontSize: (element.fontSize || 16) * textScale,
                color: element.color,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                textAlign: element.textAlign as React.CSSProperties['textAlign'],
                whiteSpace: 'pre-wrap',
                padding: '4px 8px',
              }}
              autoFocus
              onSelect={(e) => e.stopPropagation()}
            />
          ) : element.hyperlink ? (
            <a 
              href={element.hyperlink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {textContent}
            </a>
          ) : (
            textContent
          )}
        </div>
      );
    case 'image':
      const imageElement = element.imageUrl ? (
        <img
          src={element.imageUrl}
          alt="Element"
          className={`w-full h-full object-cover rounded border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}
          draggable={false}
        />
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2" style={{ fontSize: `${12 * textScale}px` }}>
              No image
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs"
              style={{ fontSize: `${10 * textScale}px` }}
            />
          </div>
        </div>
      );

      return element.hyperlink ? (
        <a 
          href={element.hyperlink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-full block"
        >
          {imageElement}
        </a>
      ) : (
        imageElement
      );
    default:
      return null;
  }
};
