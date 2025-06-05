
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({ elements, className = '' }) => {
  const getTextStyle = (element: CanvasElement) => ({
    fontSize: element.fontSize,
    color: element.color,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    textAlign: element.textAlign as any,
  });

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'multiple-choice':
        return <MultipleChoiceRenderer element={element} isEditing={false} />;
      case 'true-false':
        return <TrueFalseRenderer element={element} isEditing={false} />;
      case 'youtube':
        return <YouTubeRenderer element={element} />;
      case 'deck-embed':
        return <DeckEmbedRenderer element={element} />;
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-1 sm:p-2"
            style={{
              ...getTextStyle(element),
              wordWrap: 'break-word',
              overflow: 'visible',
              whiteSpace: 'normal',
              fontSize: `clamp(12px, ${element.fontSize || 16}px, ${(element.fontSize || 16) * 1.5}px)`,
            }}
          >
            <span className="w-full text-center leading-normal break-words">{element.content}</span>
          </div>
        );
      case 'image':
        return (
          <img
            src={element.imageUrl}
            alt="Element"
            className="w-full h-full object-cover rounded"
            draggable={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative bg-card border border-border rounded-lg overflow-hidden shadow-sm ${className}`} 
      style={{ 
        width: '100%', 
        height: '300px',
        minHeight: '300px',
        maxWidth: '500px',
        aspectRatio: '4/3'
      }}
    >
      {elements && elements.length > 0 ? (
        elements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: `${(element.x / 800) * 100}%`,
              top: `${(element.y / 533) * 100}%`,
              width: `${(element.width / 800) * 100}%`,
              height: `${(element.height / 533) * 100}%`,
              minHeight: `${(element.height / 533) * 100}%`,
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: 'center',
            }}
          >
            {renderElement(element)}
          </div>
        ))
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <span>No content to display</span>
        </div>
      )}
    </div>
  );
};
