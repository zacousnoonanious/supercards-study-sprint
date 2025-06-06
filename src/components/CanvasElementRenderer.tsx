import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { FillInBlankEditor } from './FillInBlankEditor';
import { DrawingCanvas } from './DrawingCanvas';
import { DeckSelector } from './DeckSelector';
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
      return (
        <div className="w-full h-full">
          <YouTubeRenderer element={element} />
        </div>
      );
    case 'deck-embed':
      return (
        <div className={`w-full h-full flex items-center justify-center p-2 rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          {element.deckId ? (
            <div className="text-center w-full h-full">
              <h3 className="font-medium mb-2 text-sm" style={{ fontSize: `${12 * textScale}px` }}>Embedded Deck</h3>
              <p className="text-xs text-muted-foreground mb-3" style={{ fontSize: `${10 * textScale}px` }}>{element.deckTitle}</p>
              <button 
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
                style={{ fontSize: `${10 * textScale}px` }}
                onClick={() => onUpdateElement(element.id, { deckId: undefined, deckTitle: undefined })}
              >
                Change Deck
              </button>
            </div>
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
      return (
        <div className={`w-full h-full flex items-center justify-center rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          <audio controls className="w-full h-full max-w-full max-h-full">
            <source src={element.audioUrl} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    case 'text':
      return (
        <div
          className={`w-full h-full flex items-center justify-center border rounded overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'
          } ${editingElement === element.id ? 'cursor-text' : 'cursor-text'}`}
          style={{
            fontSize: (element.fontSize || 16) * textScale,
            color: element.color,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            textAlign: element.textAlign as React.CSSProperties['textAlign'],
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
          ) : (
            <span 
              className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words leading-tight select-text"
              style={{ 
                textAlign: element.textAlign || 'center',
                fontSize: `${Math.min((element.fontSize || 16) * textScale, element.height / 2)}px`,
                lineHeight: '1.2'
              }}
            >
              {element.content}
            </span>
          )}
        </div>
      );
    case 'image':
      return (
        <img
          src={element.imageUrl}
          alt="Element"
          className={`w-full h-full object-cover rounded border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}
          draggable={false}
        />
      );
    default:
      return null;
  }
};
