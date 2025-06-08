
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface FillInBlankRendererProps {
  element: CanvasElement;
  onAnswer?: (isCorrect: boolean, userAnswers: string[]) => void;
  showAnswers?: boolean;
  disabled?: boolean;
}

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  onAnswer,
  showAnswers = false,
  disabled = false
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  // Get the content and blanks, with fallbacks
  const content = element.fillInBlankText || element.content || '';
  const blanks = element.fillInBlankBlanks || [];
  const ignoreCase = element.ignoreCase !== false;
  const showLetterCount = element.showLetterCount || false;

  useEffect(() => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
  }, [blanks.length]);

  if (!content || blanks.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
        No fill-in-the-blank content configured for this element
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string) => {
    if (disabled || submitted) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const checkAnswers = () => {
    const newResults = blanks.map((blank, index) => {
      const userAnswer = userAnswers[index] || '';
      const correctAnswer = blank.word;
      
      if (ignoreCase) {
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
      return userAnswer.trim() === correctAnswer.trim();
    });
    
    setResults(newResults);
    setSubmitted(true);
    
    const allCorrect = newResults.every(result => result);
    onAnswer?.(allCorrect, userAnswers);
  };

  const resetAnswers = () => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
  };

  const renderContent = () => {
    let renderedContent = content;
    let blankIndex = 0;

    // Sort blanks by position to replace them in order
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    sortedBlanks.forEach((blank) => {
      const placeholder = `[${blank.word}]`;
      const blankInput = showAnswers ? (
        `<span class="answer-shown">${blank.word}</span>`
      ) : (
        `<input-placeholder data-index="${blankIndex}" data-word="${blank.word}" />`
      );
      
      renderedContent = renderedContent.replace(placeholder, blankInput);
      blankIndex++;
    });

    return renderedContent;
  };

  const contentWithInputs = renderContent();
  const parts = contentWithInputs.split(/(<input-placeholder[^>]*\/>|<span class="answer-shown">[^<]*<\/span>)/);

  return (
    <div className="space-y-4">
      <div className="text-base leading-relaxed">
        {parts.map((part, index) => {
          if (part.includes('<input-placeholder')) {
            const match = part.match(/data-index="(\d+)" data-word="([^"]+)"/);
            if (!match) return null;
            
            const inputIndex = parseInt(match[1]);
            const word = match[2];
            const isCorrect = results[inputIndex];
            const isIncorrect = submitted && !isCorrect;

            return (
              <span key={index} className="inline-block mx-1">
                <Input
                  value={userAnswers[inputIndex] || ''}
                  onChange={(e) => handleAnswerChange(inputIndex, e.target.value)}
                  disabled={disabled || submitted}
                  className={`inline-block w-auto min-w-[80px] text-center border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent ${
                    isCorrect ? 'border-green-500 bg-green-50' : 
                    isIncorrect ? 'border-red-500 bg-red-50' : 
                    'border-gray-300'
                  }`}
                  placeholder={showLetterCount ? `(${word.length} letters)` : ''}
                />
                {submitted && (
                  <span className="ml-1">
                    {isCorrect ? (
                      <Check className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 inline" />
                    )}
                  </span>
                )}
              </span>
            );
          } else if (part.includes('<span class="answer-shown"')) {
            const match = part.match(/<span class="answer-shown">([^<]+)<\/span>/);
            if (!match) return null;
            return (
              <span key={index} className="font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                {match[1]}
              </span>
            );
          } else {
            return <span key={index}>{part}</span>;
          }
        })}
      </div>

      {!showAnswers && !disabled && (
        <div className="flex gap-2">
          <Button onClick={checkAnswers} disabled={submitted || userAnswers.every(answer => !answer.trim())}>
            Check Answers
          </Button>
          {submitted && (
            <Button variant="outline" onClick={resetAnswers}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      )}

      {submitted && (
        <div className="text-sm text-gray-600">
          Score: {results.filter(r => r).length} / {results.length} correct
        </div>
      )}
    </div>
  );
};
