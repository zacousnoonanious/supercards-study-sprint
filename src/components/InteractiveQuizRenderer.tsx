
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

export interface InteractiveQuizRendererProps {
  element: CanvasElement;
  onAnswer: (correct: boolean) => void;
  showResults: boolean;
  userAnswer?: number;
  requireAnswer?: boolean;
  textScale?: number;
  onAutoAdvance?: () => void;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
}

export const InteractiveQuizRenderer: React.FC<InteractiveQuizRendererProps> = ({
  element,
  onAnswer,
  showResults,
  userAnswer,
  requireAnswer = false,
  textScale = 1,
  onAutoAdvance,
  isStudyMode = false,
  onElementSelect
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(userAnswer ?? null);
  const [hasAnswered, setHasAnswered] = useState(userAnswer !== undefined && userAnswer !== null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswer = useCallback((answerIndex: number) => {
    // Don't allow changing answer once answered in quiz-only mode
    if (hasAnswered && element.autoAdvanceOnAnswer) {
      return;
    }
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    const correct = answerIndex === element.correctAnswer;
    
    if (onAnswer) {
      onAnswer(correct);
    }

    // Show immediate feedback if configured
    if (element.showImmediateFeedback) {
      setShowFeedback(true);
      
      // Auto-advance if configured
      if (element.autoAdvanceOnAnswer && onAutoAdvance) {
        setTimeout(() => {
          onAutoAdvance();
        }, 2000); // Wait 2 seconds to show feedback before advancing
      }
    }
  }, [hasAnswered, element.autoAdvanceOnAnswer, element.correctAnswer, element.showImmediateFeedback, onAnswer, onAutoAdvance]);

  const handleElementClick = useCallback((e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  }, [isStudyMode, onElementSelect, element.id]);

  const getButtonVariant = useCallback((index: number) => {
    const shouldShowResults = showResults || (element.showImmediateFeedback && showFeedback);
    
    if (!hasAnswered || !shouldShowResults) {
      return selectedAnswer === index ? 'default' : 'outline';
    }
    
    // Show results
    if (index === element.correctAnswer) {
      return 'default'; // Correct answer is highlighted
    }
    if (selectedAnswer === index && index !== element.correctAnswer) {
      return 'destructive'; // Wrong selected answer
    }
    return 'outline';
  }, [showResults, element.showImmediateFeedback, element.correctAnswer, showFeedback, hasAnswered, selectedAnswer]);

  const getButtonIcon = useCallback((index: number) => {
    const shouldShowResults = showResults || (element.showImmediateFeedback && showFeedback);
    
    if (!shouldShowResults || !hasAnswered) return null;
    
    if (index === element.correctAnswer) {
      return <CheckCircle className="w-4 h-4 ml-2 text-green-600" />;
    }
    if (selectedAnswer === index && index !== element.correctAnswer) {
      return <XCircle className="w-4 h-4 ml-2 text-red-600" />;
    }
    return null;
  }, [showResults, element.showImmediateFeedback, element.correctAnswer, showFeedback, hasAnswered, selectedAnswer]);

  const shouldShowFeedbackText = useCallback(() => {
    return (showResults || (element.showImmediateFeedback && showFeedback)) && hasAnswered;
  }, [showResults, element.showImmediateFeedback, showFeedback, hasAnswered]);

  // In quiz-only mode with auto-advance, disable buttons after answering
  const areButtonsDisabled = useCallback(() => {
    if (isStudyMode) return false;
    if (hasAnswered && element.autoAdvanceOnAnswer) return true;
    return hasAnswered && !showResults && !element.showImmediateFeedback;
  }, [isStudyMode, hasAnswered, element.autoAdvanceOnAnswer, showResults, element.showImmediateFeedback]);

  if (element.type === 'multiple-choice') {
    return (
      <div 
        className={`p-4 space-y-4 ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
        onClick={handleElementClick}
      >
        <h3 className="font-medium text-center" style={{ fontSize: `${14 * textScale}px` }}>
          {element.content}
        </h3>
        <div className="space-y-2">
          {element.multipleChoiceOptions?.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(index)}
              className="w-full justify-between"
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(index);
              }}
              disabled={areButtonsDisabled()}
              style={{ fontSize: `${12 * textScale}px` }}
            >
              <span>{option}</span>
              {getButtonIcon(index)}
            </Button>
          ))}
        </div>
        {shouldShowFeedbackText() && (
          <div className="text-center pt-2">
            <p className={`font-medium ${
              selectedAnswer === element.correctAnswer ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: `${12 * textScale}px` }}>
              {selectedAnswer === element.correctAnswer ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (element.type === 'true-false') {
    const options = ['True', 'False'];
    
    return (
      <div 
        className={`p-4 space-y-4 ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
        onClick={handleElementClick}
      >
        <h3 className="font-medium text-center" style={{ fontSize: `${14 * textScale}px` }}>
          {element.content}
        </h3>
        <div className="flex gap-4 justify-center">
          {options.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(index)}
              className="flex-1 justify-between"
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(index);
              }}
              disabled={areButtonsDisabled()}
              style={{ fontSize: `${12 * textScale}px` }}
            >
              <span>{option}</span>
              {getButtonIcon(index)}
            </Button>
          ))}
        </div>
        {shouldShowFeedbackText() && (
          <div className="text-center pt-2">
            <p className={`font-medium ${
              selectedAnswer === element.correctAnswer ? 'text-green-600' : 'text-red-600'
            }`} style={{ fontSize: `${12 * textScale}px` }}>
              {selectedAnswer === element.correctAnswer ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
