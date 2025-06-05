
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface FillInBlankRendererProps {
  element: CanvasElement;
  onAnswer?: (correct: boolean) => void;
  showResults?: boolean;
  userAnswers?: {[blankId: string]: string};
  requireAnswer?: boolean;
  textScale?: number;
}

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  onAnswer,
  showResults = false,
  userAnswers = {},
  requireAnswer = false,
  textScale = 1
}) => {
  const [answers, setAnswers] = useState<{[blankId: string]: string}>(userAnswers);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const blanks = element.fillInBlankBlanks || [];
  const originalText = element.fillInBlankText || '';

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string) => {
    if (element.ignoreCase) {
      return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }
    return userAnswer.trim() === correctAnswer.trim();
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    const allCorrect = blanks.every(blank => 
      checkAnswer(answers[blank.id] || '', blank.word)
    );
    
    if (onAnswer) {
      onAnswer(allCorrect);
    }
  };

  const renderTextWithInputs = () => {
    if (!originalText) return null;

    const words = originalText.split(/(\s+)/);
    let wordIndex = 0;

    return words.map((segment, index) => {
      if (segment.trim()) {
        const currentWordIndex = wordIndex++;
        const blank = blanks.find(b => b.position === currentWordIndex);
        
        if (blank) {
          const userAnswer = answers[blank.id] || '';
          const isCorrect = checkAnswer(userAnswer, blank.word);
          
          return (
            <span key={index} className="inline-block mx-1">
              <Input
                value={userAnswer}
                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                disabled={hasSubmitted && showResults}
                className={`inline-block w-auto min-w-[80px] h-6 text-xs text-center ${
                  showResults && hasSubmitted
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : ''
                }`}
                style={{ 
                  width: `${Math.max(80, blank.word.length * 8 + (element.showLetterCount ? 20 : 0))}px`,
                  fontSize: `${12 * textScale}px`
                }}
                placeholder={element.showLetterCount ? `(${blank.word.length})` : '___'}
              />
              {showResults && hasSubmitted && (
                <span className="ml-1">
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600 inline" />
                      <span className="text-xs text-red-600 ml-1">({blank.word})</span>
                    </>
                  )}
                </span>
              )}
            </span>
          );
        }
        
        return <span key={index} style={{ fontSize: `${12 * textScale}px` }}>{segment}</span>;
      }
      return <span key={index}>{segment}</span>;
    });
  };

  if (blanks.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-3 flex items-center justify-center">
          <p className="text-xs text-gray-500">No blanks configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-3 space-y-3">
        <div 
          className="leading-relaxed"
          style={{ fontSize: `${12 * textScale}px` }}
        >
          {renderTextWithInputs()}
        </div>
        
        {!hasSubmitted && !showResults && (
          <Button
            onClick={handleSubmit}
            size="sm"
            className="w-full text-xs"
            disabled={requireAnswer && blanks.some(blank => !answers[blank.id]?.trim())}
          >
            Submit
          </Button>
        )}
        
        {showResults && hasSubmitted && (
          <div className="text-center pt-2">
            <p className={`font-medium text-xs ${
              blanks.every(blank => checkAnswer(answers[blank.id] || '', blank.word))
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {blanks.every(blank => checkAnswer(answers[blank.id] || '', blank.word))
                ? 'All correct!' 
                : 'Some answers are incorrect'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
