
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
  textScale?: number;
}

// Levenshtein distance for spell checking
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

const getAnswerScore = (userAnswer: string, correctAnswer: string, ignoreCase: boolean): 'correct' | 'close' | 'incorrect' => {
  const normalize = (text: string) => ignoreCase ? text.toLowerCase().trim() : text.trim();
  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = normalize(correctAnswer);
  
  if (normalizedUser === normalizedCorrect) {
    return 'correct';
  }
  
  // Check if it's close (spelling error, capitalization)
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
  const similarity = 1 - (distance / maxLength);
  
  if (similarity >= 0.8) { // 80% similarity threshold
    return 'close';
  }
  
  return 'incorrect';
};

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  onAnswer,
  showAnswers = false,
  disabled = false,
  textScale = 1
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<('correct' | 'close' | 'incorrect')[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null);

  // Get the content and blanks, with fallbacks
  const content = element.fillInBlankText || element.content || '';
  const blanks = element.fillInBlankBlanks || [];
  const ignoreCase = element.ignoreCase !== false;
  const showLetterCount = element.showLetterCount || false;

  useEffect(() => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
    setActiveBlankIndex(null);
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

  const handleBlankClick = (index: number) => {
    if (disabled || submitted) return;
    setActiveBlankIndex(index);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Move to next blank or submit if this is the last one
      const nextBlankIndex = index + 1;
      if (nextBlankIndex < blanks.length) {
        setActiveBlankIndex(nextBlankIndex);
      } else {
        // Check if all blanks are filled
        const allFilled = userAnswers.every((answer, i) => answer.trim() !== '');
        if (allFilled) {
          checkAnswers();
        }
      }
    }
  };

  const checkAnswers = () => {
    const newResults = blanks.map((blank, index) => {
      const userAnswer = userAnswers[index] || '';
      const correctAnswer = blank.word;
      return getAnswerScore(userAnswer, correctAnswer, ignoreCase);
    });
    
    setResults(newResults);
    setSubmitted(true);
    setActiveBlankIndex(null);
    
    const allCorrect = newResults.every(result => result === 'correct');
    onAnswer?.(allCorrect, userAnswers);
  };

  const resetAnswers = () => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
    setActiveBlankIndex(null);
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
    <div className="space-y-4" style={{ fontSize: `${14 * textScale}px` }}>
      <div className="text-base leading-relaxed">
        {parts.map((part, index) => {
          if (part.includes('<input-placeholder')) {
            const match = part.match(/data-index="(\d+)" data-word="([^"]+)"/);
            if (!match) return null;
            
            const inputIndex = parseInt(match[1]);
            const word = match[2];
            const result = results[inputIndex];
            const isActive = activeBlankIndex === inputIndex;

            return (
              <span key={index} className="inline-block mx-1 relative">
                {isActive ? (
                  <Input
                    value={userAnswers[inputIndex] || ''}
                    onChange={(e) => handleAnswerChange(inputIndex, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, inputIndex)}
                    onBlur={() => setActiveBlankIndex(null)}
                    autoFocus
                    className={`inline-block w-auto min-w-[80px] text-center border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent border-blue-500 focus:border-blue-600`}
                    placeholder={showLetterCount ? `(${word.length} letters)` : ''}
                    style={{ fontSize: `${12 * textScale}px` }}
                  />
                ) : (
                  <span
                    onClick={() => handleBlankClick(inputIndex)}
                    className={`inline-block min-w-[80px] text-center px-2 py-1 border-b-2 cursor-pointer ${
                      result === 'correct' ? 'border-green-500 bg-green-50 text-green-800' :
                      result === 'close' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
                      result === 'incorrect' ? 'border-red-500 bg-red-50 text-red-800' :
                      userAnswers[inputIndex] ? 'border-gray-400 bg-gray-50' :
                      'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    style={{ fontSize: `${12 * textScale}px` }}
                  >
                    {userAnswers[inputIndex] || '_____'}
                  </span>
                )}
                {submitted && (
                  <span className="ml-1">
                    {result === 'correct' ? (
                      <Check className="w-4 h-4 text-green-500 inline" />
                    ) : result === 'close' ? (
                      <span className="text-yellow-500 text-xs">~</span>
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
          <Button 
            onClick={checkAnswers} 
            disabled={submitted || userAnswers.every(answer => !answer.trim())}
            style={{ fontSize: `${12 * textScale}px` }}
          >
            Check Answers
          </Button>
          {submitted && (
            <Button 
              variant="outline" 
              onClick={resetAnswers}
              style={{ fontSize: `${12 * textScale}px` }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      )}

      {submitted && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600" style={{ fontSize: `${11 * textScale}px` }}>
            Score: {results.filter(r => r === 'correct').length} / {results.length} correct
            {results.some(r => r === 'close') && (
              <span className="ml-2 text-yellow-600">
                ({results.filter(r => r === 'close').length} close)
              </span>
            )}
          </div>
          
          {results.some(r => r === 'close') && (
            <div className="text-xs text-yellow-600" style={{ fontSize: `${10 * textScale}px` }}>
              Yellow answers are close but have spelling or capitalization errors
            </div>
          )}
        </div>
      )}
    </div>
  );
};
