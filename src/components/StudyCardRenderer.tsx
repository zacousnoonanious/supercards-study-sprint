
import React, { useState } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { MultipleChoiceRenderer, TrueFalseRenderer } from './InteractiveElements';
import { FillInBlankRenderer } from './FillInBlankRenderer';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: {[elementId: string]: number};
  onFillInBlankAnswer?: (elementId: string, correct: boolean) => void;
  fillInBlankResults?: {[elementId: string]: boolean};
  requireAnswer?: boolean;
  textScale?: number;
  cardWidth?: number;
  cardHeight?: number;
  isInformationalCard?: boolean;
  className?: string;
  style?: React.CSSProperties;
  allowMultipleAttempts?: boolean;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({
  elements,
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  onFillInBlankAnswer,
  fillInBlankResults = {},
  requireAnswer = false,
  textScale = 1,
  cardWidth = 600,
  cardHeight = 400,
  isInformationalCard = false,
  className = '',
  style = {},
  allowMultipleAttempts = true,
}) => {
  const [localQuizAnswers, setLocalQuizAnswers] = useState<{[elementId: string]: number}>({});
  const [localFillInBlankResults, setLocalFillInBlankResults] = useState<{[elementId: string]: boolean}>({});

  const handleQuizAnswer = (elementId: string, correct: boolean, answerIndex: number) => {
    setLocalQuizAnswers(prev => ({ ...prev, [elementId]: answerIndex }));
    onQuizAnswer?.(elementId, correct, answerIndex);
  };

  const handleFillInBlankAnswer = (elementId: string, correct: boolean) => {
    setLocalFillInBlankResults(prev => ({ ...prev, [elementId]: correct }));
    onFillInBlankAnswer?.(elementId, correct);
  };

  const renderElement = (element: CanvasElement) => {
    const elementStyle = {
      position: 'absolute' as const,
      left: `${element.x || 0}px`,
      top: `${element.y || 0}px`,
      width: `${element.width || 100}px`,
      height: `${element.height || 100}px`,
      zIndex: element.zIndex || 1,
    };

    switch (element.type) {
      case 'multiple-choice':
        return (
          <div key={element.id} style={elementStyle}>
            <MultipleChoiceRenderer
              element={element}
              isEditing={false}
              onUpdate={() => {}}
              textScale={textScale}
              onAnswer={handleQuizAnswer}
              showResults={showQuizResults}
              selectedAnswer={quizAnswers[element.id] || localQuizAnswers[element.id]}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          </div>
        );
      
      case 'true-false':
        return (
          <div key={element.id} style={elementStyle}>
            <TrueFalseRenderer
              element={element}
              isEditing={false}
              onUpdate={() => {}}
              textScale={textScale}
              onAnswer={handleQuizAnswer}
              showResults={showQuizResults}
              selectedAnswer={quizAnswers[element.id] || localQuizAnswers[element.id]}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          </div>
        );
      
      case 'fill-in-blank':
        return (
          <div key={element.id} style={elementStyle}>
            <FillInBlankRenderer
              element={element}
              textScale={textScale}
              onAnswer={handleFillInBlankAnswer}
              showResults={showQuizResults}
              userAnswers={fillInBlankResults}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          </div>
        );
      
      default:
        return (
          <div key={element.id} style={elementStyle}>
            <CanvasElementRenderer
              element={element}
              editingElement={null}
              onUpdateElement={() => {}}
              onEditingChange={() => {}}
              textScale={textScale}
              isStudyMode={true}
            />
          </div>
        );
    }
  };

  return (
    <div 
      className={`relative bg-white overflow-hidden ${className}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        ...style,
      }}
    >
      {elements.map(renderElement)}
    </div>
  );
};
