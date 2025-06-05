import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { DrawingCanvas } from './DrawingCanvas';
import { DeckSelector } from './DeckSelector';
import { useTheme } from '@/contexts/ThemeContext';

interface CanvasElementRendererProps {
  element: CanvasElement;
  editingElement: string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onEditingChange: (id: string | null) => void;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  editingElement,
  onUpdateElement,
  onEditingChange,
}) => {
  const { theme } = useTheme();

  switch (element.type) {
    case 'multiple-choice':
      return <MultipleChoiceRenderer element={element} isEditing={true} />;
    case 'true-false':
      return <TrueFalseRenderer element={element} isEditing={true} />;
    case 'youtube':
      return <YouTubeRenderer element={element} />;
    case 'deck-embed':
      return (
        <div className={`w-full h-full flex items-center justify-center p-4 rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          {element.deckId ? (
            <div className="text-center w-full">
              <h3 className="font-medium mb-2 text-sm">Embedded Deck</h3>
              <p className="text-xs text-muted-foreground mb-3">{element.deckTitle}</p>
              <button 
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
                onClick={() => onUpdateElement(element.id, { deckId: undefined, deckTitle: undefined })}
              >
                Change Deck
              </button>
            </div>
          ) : (
            <div className="w-full">
              <DeckSelector
                onDeckSelect={(deckId, deckTitle) => {
                  onUpdateElement(element.id, { deckId, deckTitle });
                }}
                currentDeckId={element.deckId}
              />
            </div>
          )}
        </div>
      );
    case 'drawing':
      return (
        <div className="w-full h-full relative group">
          {/* Draggable header */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-move z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-gray-600 dark:text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 7h8v2h-8V7zM13 15h8v2h-8v-2zM3 7h8v2H3V7zM3 15h8v2H3v-2z"/>
              </svg>
            </div>
          </div>
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
          />
        </div>
      );
    case 'audio':
      return (
        <div className={`w-full h-full flex items-center justify-center p-2 rounded border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          <audio controls className="w-full">
            <source src={element.audioUrl} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    case 'text':
      return (
        <div
          className={`w-full h-full flex items-center justify-center p-2 border rounded overflow-hidden cursor-text ${
            theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'
          }`}
          style={{
            fontSize: element.fontSize,
            color: element.color,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            textAlign: element.textAlign as React.CSSProperties['textAlign'],
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
                
                // Auto-resize text element based on content
                const lines = newContent.split('\n').length;
                const longestLine = Math.max(...newContent.split('\n').map(line => line.length));
                
                const newWidth = Math.max(200, Math.min(600, longestLine * 8 + 40));
                const newHeight = Math.max(60, lines * 24 + 40);
                
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
                e.stopPropagation(); // Prevent canvas keyboard handlers
              }}
              onBlur={() => onEditingChange(null)}
              className={`w-full h-full bg-transparent border-none outline-none resize-none ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
              style={{
                fontSize: element.fontSize,
                color: element.color,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                textAlign: element.textAlign as React.CSSProperties['textAlign'],
                whiteSpace: 'pre-wrap',
              }}
              autoFocus
            />
          ) : (
            <span 
              className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words leading-tight"
              style={{ 
                textAlign: element.textAlign || 'center',
                fontSize: `${Math.min(element.fontSize || 16, element.height / 3)}px`, // Scale font to fit height
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
