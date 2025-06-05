
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer } from './InteractiveElements';
import { InteractiveQuizRenderer } from './InteractiveQuizRenderer';
import { EmbeddedDeckViewer } from './EmbeddedDeckViewer';
import { useTheme } from '@/contexts/ThemeContext';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
  style?: React.CSSProperties;
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: {[elementId: string]: number};
  requireAnswer?: boolean;
  textScale?: number;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({ 
  elements, 
  className = '', 
  style = {},
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  requireAnswer = false,
  textScale = 1
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  const getTextStyle = (element: CanvasElement) => ({
    fontSize: (element.fontSize || 16) * textScale,
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
              textScale={textScale}
            />
          );
        }
        return element.type === 'multiple-choice' 
          ? <MultipleChoiceRenderer element={element} isEditing={false} textScale={textScale} />
          : <TrueFalseRenderer element={element} isEditing={false} textScale={textScale} />;
      case 'youtube':
        return (
          <div className="w-full h-full">
            <YouTubeRenderer element={element} />
          </div>
        );
      case 'deck-embed':
        return element.deckId ? (
          <div className="w-full h-full">
            <EmbeddedDeckViewer
              deckId={element.deckId}
              width={element.width}
              height={element.height}
              className="w-full h-full"
              textScale={textScale}
            />
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center p-4 rounded ${
            isDarkTheme ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No deck selected for embedding</p>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className={`w-full h-full flex items-center justify-center p-1 sm:p-2 rounded ${
            isDarkTheme ? 'bg-gray-800' : 'bg-white'
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
            className="w-full h-full flex items-center justify-center p-1 sm:p-2"
            style={{
              ...getTextStyle(element),
              wordWrap: 'break-word',
              overflow: 'visible',
              whiteSpace: 'pre-wrap',
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
