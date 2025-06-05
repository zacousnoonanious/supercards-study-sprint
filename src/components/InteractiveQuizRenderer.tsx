import React, { useState } from 'react';
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
}

export const InteractiveQuizRenderer: React.FC<InteractiveQuizRendererProps> = ({
  element,
  onAnswer,
  showResults,
  userAnswer,
  requireAnswer = false,
  textScale = 1
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(userAnswer);
  const [hasAnswered, setHasAnswered] = useState(userAnswer !== null);

  const handleAnswer = (answerIndex: number) => {
    if (hasAnswered && !showResults) return;
    
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    if (onAnswer) {
      const correct = answerIndex === element.correctAnswer;
      onAnswer(correct);
    }
  };

  const getButtonVariant = (index: number) => {
    if (!hasAnswered || !showResults) {
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
  };

  const getButtonIcon = (index: number) => {
    if (!showResults || !hasAnswered) return null;
    
    if (index === element.correctAnswer) {
      return <CheckCircle className="w-4 h-4 ml-2 text-green-600" />;
    }
    if (selectedAnswer === index && index !== element.correctAnswer) {
      return <XCircle className="w-4 h-4 ml-2 text-red-600" />;
    }
    return null;
  };

  if (element.type === 'multiple-choice') {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-medium text-center">{element.content}</h3>
        <div className="space-y-2">
          {element.multipleChoiceOptions?.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(index)}
              className="w-full justify-between"
              onClick={() => handleAnswer(index)}
              disabled={hasAnswered && !showResults}
            >
              <span>{option}</span>
              {getButtonIcon(index)}
            </Button>
          ))}
        </div>
        {showResults && hasAnswered && (
          <div className="text-center pt-2">
            <p className={`font-medium ${
              selectedAnswer === element.correctAnswer ? 'text-green-600' : 'text-red-600'
            }`}>
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
      <div className="p-4 space-y-4">
        <h3 className="font-medium text-center">{element.content}</h3>
        <div className="flex gap-4 justify-center">
          {options.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(index)}
              className="flex-1 justify-between"
              onClick={() => handleAnswer(index)}
              disabled={hasAnswered && !showResults}
            >
              <span>{option}</span>
              {getButtonIcon(index)}
            </Button>
          ))}
        </div>
        {showResults && hasAnswered && (
          <div className="text-center pt-2">
            <p className={`font-medium ${
              selectedAnswer === element.correctAnswer ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedAnswer === element.correctAnswer ? 'Correct!' : 'Incorrect'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
