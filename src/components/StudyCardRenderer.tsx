
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { InteractiveQuizRenderer } from './InteractiveQuizRenderer';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
  style?: React.CSSProperties;
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: {[elementId: string]: number};
  requireAnswer?: boolean;
  textScale?: number;
  cardWidth?: number;
  cardHeight?: number;
  isInformationalCard?: boolean;
  onElementSelect?: (elementId: string) => void;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({
  elements,
  className = '',
  style = {},
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  requireAnswer = false,
  textScale = 1,
  cardWidth = 600,
  cardHeight = 400,
  isInformationalCard = false,
  onElementSelect,
}) => {
  const handleQuizAnswer = (elementId: string, correct: boolean, answerIndex: number) => {
    if (onQuizAnswer) {
      onQuizAnswer(elementId, correct, answerIndex);
    }
  };

  // Calculate aspect ratio
  const aspectRatio = cardWidth / cardHeight;
  const maxWidth = isInformationalCard ? '100%' : '600px';
  const maxHeight = isInformationalCard ? '100%' : '400px';
  
  return (
    <div 
      className={`relative bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{
        width: maxWidth,
        height: maxHeight,
        aspectRatio: isInformationalCard ? 'unset' : aspectRatio,
        maxWidth: isInformationalCard ? 'none' : '600px',
        ...style
      }}
    >
      {elements.map((element) => {
        // For quiz elements in study mode, use InteractiveQuizRenderer directly
        if ((element.type === 'multiple-choice' || element.type === 'true-false') && onQuizAnswer) {
          return (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: `${(element.x / cardWidth) * 100}%`,
                top: `${(element.y / cardHeight) * 100}%`,
                width: `${(element.width / cardWidth) * 100}%`,
                height: `${(element.height / cardHeight) * 100}%`,
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: 'center',
                zIndex: element.zIndex || 0,
              }}
            >
              <InteractiveQuizRenderer
                element={element}
                onAnswer={(correct) => handleQuizAnswer(element.id, correct, quizAnswers[element.id] || 0)}
                showResults={showQuizResults}
                userAnswer={quizAnswers[element.id]}
                requireAnswer={requireAnswer}
                textScale={textScale}
                isStudyMode={true}
                onElementSelect={onElementSelect}
              />
            </div>
          );
        }

        // For all other elements, use the regular renderer
        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: `${(element.x / cardWidth) * 100}%`,
              top: `${(element.y / cardHeight) * 100}%`,
              width: `${(element.width / cardWidth) * 100}%`,
              height: `${(element.height / cardHeight) * 100}%`,
              transform: `rotate(${element.rotation || 0}deg)`,
              transformOrigin: 'center',
              zIndex: element.zIndex || 0,
            }}
          >
            <CanvasElementRenderer
              element={element}
              editingElement={null}
              onUpdateElement={() => {}}
              onEditingChange={() => {}}
              textScale={textScale}
              isStudyMode={true}
              onElementSelect={onElementSelect}
            />
          </div>
        );
      })}
    </div>
  );
};
