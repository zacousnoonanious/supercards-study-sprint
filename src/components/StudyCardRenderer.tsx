
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { InteractiveQuizRenderer } from './InteractiveQuizRenderer';
import { DeckSelector } from './DeckSelector';
import { useTheme } from '@/contexts/ThemeContext';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
  style?: React.CSSProperties;
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: {[elementId: string]: number};
  requireAnswer?: boolean;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({ 
  elements, 
  className = '', 
  style = {},
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  requireAnswer = false
}) => {
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
      case 'true-false':
        if (onQuizAnswer) {
          return (
            <InteractiveQuizRenderer
              element={element}
              onAnswer={(correct) => onQuizAnswer(element.id, correct, quizAnswers[element.id] || 0)}
              showResults={showQuizResults}
              userAnswer={quizAnswers[element.id]}
              requireAnswer={requireAnswer}
            />
          );
        }
        return element.type === 'multiple-choice' 
          ? <MultipleChoiceRenderer element={element} isEditing={false} />
          : <TrueFalseRenderer element={element} isEditing={false} />;
      case 'youtube':
        return <YouTubeRenderer element={element} />;
      case 'deck-embed':
        return (
          <div className={`w-full h-full flex items-center justify-center p-4 rounded ${
            isDarkTheme ? 'bg-gray-800' : 'bg-white'
          }`}>
            {element.deckId ? (
              <div className="text-center">
                <h3 className="font-medium mb-2">Embedded Deck</h3>
                <p className="text-sm text-muted-foreground">{element.deckTitle}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
                  onClick={() => window.open(`/set/${element.deckId}`, '_blank')}
                >
                  Open Deck
                </button>
              </div>
            ) : (
              <DeckSelector
                onDeckSelect={(deckId, deckTitle) => {
                  // This would need to be handled by the parent component
                  console.log('Deck selected:', deckId, deckTitle);
                }}
              />
            )}
          </div>
        );
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
      case 'drawing':
        return (
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: element.drawingData ? `url(${element.drawingData})` : 'none',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          />
        );
      default:
        return null;
    }
  };

  const defaultStyle = {
    width: '100%', 
    height: '300px',
    minHeight: '300px',
    maxWidth: '500px',
    aspectRatio: '4/3'
  };

  return (
    <div 
      className={`relative border border-border rounded-lg overflow-hidden shadow-sm ${
        isDarkTheme 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-card border-gray-200'
      } ${className}`} 
      style={{ ...defaultStyle, ...style }}
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
