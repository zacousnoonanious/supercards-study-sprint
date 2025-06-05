
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { useTheme } from '@/contexts/ThemeContext';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({ elements, className = '' }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

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
      case 'audio':
        return (
          <div className={`w-full h-full flex items-center justify-center p-1 sm:p-2 rounded ${
            isDarkTheme ? 'bg-gray-800' : 'bg-white'
          }`}>
            <audio controls className="w-full max-w-full">
              <source src={element.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center p-1 sm:p-2"
            style={{
              ...getTextStyle(element),
              wordWrap: 'break-word',
              overflow: 'visible',
              whiteSpace: 'pre-wrap',
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
      className={`relative border border-border rounded-lg overflow-hidden shadow-sm ${
        isDarkTheme 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-card border-gray-200'
      } ${className}`} 
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
        <div className={`w-full h-full flex items-center justify-center ${
          isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
        }`}>
          <span>No content to display</span>
        </div>
      )}
    </div>
  );
};
