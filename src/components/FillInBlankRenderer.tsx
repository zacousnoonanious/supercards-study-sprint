
import React, { useState, useEffect, useCallback } from 'react';
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
  isStudyMode?: boolean;
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
  
  console.log('Comparing:', { userAnswer, correctAnswer, normalizedUser, normalizedCorrect, ignoreCase });
  
  if (normalizedUser === normalizedCorrect) {
    console.log('Exact match - correct');
    return 'correct';
  }
  
  // Check if it's close (spelling error, capitalization)
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
  const similarity = 1 - (distance / maxLength);
  
  console.log('Similarity check:', { distance, maxLength, similarity });
  
  if (similarity >= 0.8) { // 80% similarity threshold
    console.log('Close match - close');
    return 'close';
  }
  
  console.log('No match - incorrect');
  return 'incorrect';
};

export const FillInBlankRenderer: React.FC<FillInBlankRendererProps> = ({
  element,
  onAnswer,
  showAnswers = false,
  disabled = false,
  textScale = 1,
  isStudyMode = false
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

  console.log('FillInBlank data:', { content, blanks, ignoreCase });

  useEffect(() => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
    setActiveBlankIndex(null);
  }, [blanks.length, element.fillInBlankText]);

  const handleAnswerChange = useCallback((index: number, value: string) => {
    if (disabled || submitted) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
    console.log('Answer changed:', { index, value, newAnswers });
  }, [disabled, submitted, userAnswers]);

  const handleBlankClick = useCallback((index: number) => {
    if (disabled || submitted) return;
    setActiveBlankIndex(index);
  }, [disabled, submitted]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      // Move to next blank or submit if this is the last one
      const nextBlankIndex = index + 1;
      if (nextBlankIndex < blanks.length) {
        setActiveBlankIndex(nextBlankIndex);
      } else {
        setActiveBlankIndex(null);
        if (isStudyMode) {
          // Auto-check answers in study mode
          checkAnswers();
        }
      }
    }
  }, [blanks.length, isStudyMode]);

  const checkAnswers = useCallback(() => {
    console.log('Checking answers:', { userAnswers, blanks });
    
    // Sort blanks by position to ensure correct order
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);
    
    const newResults = sortedBlanks.map((blank, index) => {
      const userAnswer = userAnswers[index] || '';
      const correctAnswer = blank.word;
      console.log(`Checking blank ${index}:`, { userAnswer, correctAnswer, blank });
      return getAnswerScore(userAnswer, correctAnswer, ignoreCase);
    });
    
    console.log('Results:', newResults);
    setResults(newResults);
    setSubmitted(true);
    setActiveBlankIndex(null);
    
    // Calculate if all answers are correct (including close answers as correct)
    const allCorrect = newResults.every(result => result === 'correct' || result === 'close');
    
    // Call the callback with the overall result
    if (onAnswer) {
      onAnswer(allCorrect, userAnswers);
    }
  }, [blanks, userAnswers, ignoreCase, onAnswer]);

  const resetAnswers = useCallback(() => {
    setUserAnswers(new Array(blanks.length).fill(''));
    setSubmitted(false);
    setResults([]);
    setActiveBlankIndex(null);
  }, [blanks.length]);

  if (!content || blanks.length === 0) {
    return (
      <div 
        className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500 flex items-center justify-center h-full"
        style={{ fontSize: `${12 * textScale}px` }}
      >
        Configure text and blanks in the options panel →
      </div>
    );
  }

  const renderContent = () => {
    const words = content.split(/(\s+)/);
    let currentWordIndex = 0;
    
    // Sort blanks by position for proper mapping
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);
    
    return words.map((segment, segmentIndex) => {
      if (segment.trim()) {
        const wordIndex = currentWordIndex++;
        const blankIndex = sortedBlanks.findIndex(b => b.position === wordIndex);
        const blank = blankIndex >= 0 ? sortedBlanks[blankIndex] : null;
        
        if (blank) {
          const result = results[blankIndex];
          const isActive = activeBlankIndex === blankIndex;
          const userAnswer = userAnswers[blankIndex] || '';

          if (showAnswers) {
            return (
              <span 
                key={segmentIndex} 
                className="inline-block font-semibold text-blue-600 bg-blue-50 px-1 rounded mx-1"
                style={{ fontSize: `${14 * textScale}px` }}
              >
                {blank.word}
              </span>
            );
          }

          // Show underscores when not active and no user input
          const displayText = !isActive && !userAnswer ? '____' : userAnswer;

          return (
            <span key={segmentIndex} className="inline-block mx-1 relative">
              {isActive ? (
                <Input
                  value={userAnswer}
                  onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, blankIndex)}
                  onBlur={() => setActiveBlankIndex(null)}
                  autoFocus
                  className="inline-block w-auto min-w-[80px] text-center border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent border-blue-500 focus:border-blue-600 px-1 py-0"
                  placeholder={showLetterCount ? `(${blank.word.length})` : '____'}
                  style={{ 
                    fontSize: `${14 * textScale}px`,
                    height: 'auto',
                    minHeight: `${20 * textScale}px`
                  }}
                />
              ) : (
                <span
                  onClick={() => handleBlankClick(blankIndex)}
                  className={`inline-block min-w-[60px] text-center px-2 py-1 border-b-2 cursor-pointer transition-colors ${
                    result === 'correct' ? 'border-green-500 bg-green-50 text-green-800' :
                    result === 'close' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
                    result === 'incorrect' ? 'border-red-500 bg-red-50 text-red-800' :
                    userAnswer ? 'border-gray-400 bg-gray-50' :
                    'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: `${14 * textScale}px` }}
                >
                  {displayText}
                </span>
              )}
              {submitted && (
                <span className="ml-1 align-middle">
                  {result === 'correct' ? (
                    <Check className="w-3 h-3 text-green-500 inline" />
                  ) : result === 'close' ? (
                    <span className="text-yellow-500 text-xs font-bold">~</span>
                  ) : (
                    <X className="w-3 h-3 text-red-500 inline" />
                  )}
                </span>
              )}
            </span>
          );
        }
        
        return (
          <span key={segmentIndex} style={{ fontSize: `${14 * textScale}px` }}>
            {segment}
          </span>
        );
      } else {
        return <span key={segmentIndex}>{segment}</span>;
      }
    });
  };

  const correctCount = results.filter(r => r === 'correct' || r === 'close').length;
  const totalBlanks = results.length;

  return (
    <div className="space-y-4 h-full flex flex-col" style={{ fontSize: `${14 * textScale}px` }}>
      <div className="flex-1 text-base leading-relaxed">
        {renderContent()}
      </div>

      {!showAnswers && !disabled && (
        <div className="flex gap-2 mt-auto">
          <Button 
            onClick={checkAnswers} 
            disabled={submitted || userAnswers.every(answer => !answer.trim())}
            size="sm"
            style={{ fontSize: `${12 * textScale}px` }}
          >
            Submit
          </Button>
          {submitted && (
            <Button 
              variant="outline" 
              onClick={resetAnswers}
              size="sm"
              style={{ fontSize: `${12 * textScale}px` }}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      )}

      {submitted && (
        <div className="space-y-2 mt-2">
          <div className="text-sm font-medium" style={{ fontSize: `${12 * textScale}px` }}>
            You got {correctCount} out of {totalBlanks} correct.
          </div>
          
          {results.some(r => r === 'close') && (
            <div className="text-xs text-yellow-600" style={{ fontSize: `${10 * textScale}px` }}>
              ~ indicates close answers with minor spelling/case differences
            </div>
          )}
        </div>
      )}
    </div>
  );
};
