
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { DrawingCanvas } from './DrawingCanvas';
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
      return <DeckEmbedRenderer element={element} />;
    case 'drawing':
      return (
        <DrawingCanvas
          width={element.width}
          height={element.height}
          onDrawingComplete={(drawingData, animated) => {
            onUpdateElement(element.id, { 
              drawingData,
              animated 
            });
          }}
          initialDrawing={element.drawingData}
          strokeColor={element.strokeColor}
          strokeWidth={element.strokeWidth}
          animated={element.animated}
        />
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
              onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onEditingChange(null);
                }
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
              className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
              style={{ textAlign: element.textAlign || 'center' }}
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
