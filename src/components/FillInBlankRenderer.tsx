
import React, { useState, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FillInBlankRendererProps {
  element: CanvasElement;
  textScale?: number;
  onAnswer?: (elementId: string, correct: boolean) => void;
  showResults?: boolean;
  userAnswers?: {[elementId: string]: boolean};
  allowMultipleAttempts?: boolean;
}

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  textScale = 1,
  onAnswer,
  showResults = false,
  userAnswers = {},
  allowMultipleAttempts = true,
}) => {
  const [userInputs, setUserInputs] = useState<{[key: number]: string}>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState<{[key: number]: number}>({});

  // Extract sentences from fillInBlankText and blanks from fillInBlankBlanks
  const text = element.fillInBlankText || '';
  const blanks = element.fillInBlankBlanks || [];
  
  // Split text by blanks (represented by ___) to create sentences
  const sentences = text ? [text] : [];

  useEffect(() => {
    // Reset state when element changes
    setUserInputs({});
    setHasSubmitted(false);
    setCurrentAttempts({});
  }, [element.id]);

  const handleInputChange = (blankIndex: number, value: string) => {
    if (hasSubmitted && !allowMultipleAttempts) return;
    setUserInputs(prev => ({ ...prev, [blankIndex]: value }));
  };

  const checkAnswer = (blankIndex: number) => {
    const userAnswer = userInputs[blankIndex]?.trim().toLowerCase() || '';
    const blank = blanks[blankIndex];
    if (!blank) return false;
    
    // Check against the word stored in the blank
    return blank.word.toLowerCase() === userAnswer;
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    const allCorrect = blanks.every((_, index) => checkAnswer(index));
    onAnswer?.(element.id, allCorrect);
  };

  const handleRetry = (blankIndex: number) => {
    setCurrentAttempts(prev => ({ 
      ...prev, 
      [blankIndex]: (prev[blankIndex] || 0) + 1 
    }));
    setUserInputs(prev => ({ ...prev, [blankIndex]: '' }));
  };

  const renderSentenceWithBlanks = () => {
    if (!text || blanks.length === 0) {
      return (
        <div className="text-center text-muted-foreground p-4">
          <p style={{ fontSize: `${14 * textScale}px` }}>
            No fill-in-the-blank content configured for this element.
          </p>
        </div>
      );
    }

    // Split text by ___ patterns and replace with input fields
    const parts = text.split(/___+/);
    let blankCounter = 0;
    
    return (
      <div className="mb-4" style={{ fontSize: `${16 * textScale}px` }}>
        {parts.map((part, partIndex) => (
          <React.Fragment key={partIndex}>
            <span>{part}</span>
            {partIndex < parts.length - 1 && blankCounter < blanks.length && (
              <span className="inline-block mx-1">
                <Input
                  className={`inline-block w-32 text-center ${
                    hasSubmitted 
                      ? checkAnswer(blankCounter) 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                      : ''
                  }`}
                  style={{ 
                    fontSize: `${14 * textScale}px`,
                    height: `${32 * textScale}px`
                  }}
                  value={userInputs[blankCounter] || ''}
                  onChange={(e) => handleInputChange(blankCounter, e.target.value)}
                  placeholder="Type answer..."
                  disabled={hasSubmitted && !allowMultipleAttempts}
                />
                {hasSubmitted && !checkAnswer(blankCounter) && allowMultipleAttempts && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-1"
                    onClick={() => handleRetry(blankCounter)}
                    style={{ fontSize: `${12 * textScale}px` }}
                  >
                    Retry
                  </Button>
                )}
                <span style={{ display: 'none' }}>{blankCounter++}</span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded border">
      <div className="space-y-4">
        <h3 className="font-semibold" style={{ fontSize: `${18 * textScale}px` }}>
          Fill in the blanks:
        </h3>
        
        <div className="space-y-2">
          {renderSentenceWithBlanks()}
        </div>

        {!hasSubmitted && (
          <Button 
            onClick={handleSubmit}
            disabled={Object.keys(userInputs).length !== blanks.length}
            style={{ fontSize: `${14 * textScale}px` }}
          >
            Submit Answers
          </Button>
        )}

        {hasSubmitted && (
          <div className="mt-4 p-3 rounded border bg-muted">
            <p style={{ fontSize: `${14 * textScale}px` }}>
              {blanks.every((_, index) => checkAnswer(index))
                ? '✅ All correct!'
                : `❌ ${blanks.filter((_, index) => checkAnswer(index)).length}/${blanks.length} correct`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
