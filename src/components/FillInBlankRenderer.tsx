
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

  const isAnswerClose = (userAnswer: string, correctAnswer: string) => {
    const user = element.ignoreCase ? userAnswer.toLowerCase().trim() : userAnswer.trim();
    const correct = element.ignoreCase ? correctAnswer.toLowerCase().trim() : correctAnswer.trim();
    
    if (user === correct) return false; // Exact match, not close
    if (user.length === 0) return false; // Empty answer, not close
    
    // Check if it's a substring or contains most of the correct answer
    if (user.includes(correct) || correct.includes(user)) return true;
    
    // Simple character similarity check
    const longer = user.length > correct.length ? user : correct;
    const shorter = user.length > correct.length ? correct : user;
    const editDistance = calculateEditDistance(user, correct);
    const similarity = 1 - (editDistance / longer.length);
    
    return similarity >= 0.6; // 60% similarity threshold
  };

  const calculateEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const getAnswerFeedback = (userAnswer: string, correctAnswer: string) => {
    if (checkAnswer(userAnswer, correctAnswer)) {
      return { type: 'correct', className: 'border-green-500 bg-green-50 text-green-800' };
    } else if (isAnswerClose(userAnswer, correctAnswer)) {
      return { type: 'close', className: 'border-yellow-500 bg-yellow-50 text-yellow-800' };
    } else {
      return { type: 'incorrect', className: 'border-red-500 bg-red-50 text-red-800' };
    }
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
          const feedback = hasSubmitted && showResults ? getAnswerFeedback(userAnswer, blank.word) : null;
          
          return (
            <span key={index} className="inline-block mx-1">
              <Input
                value={userAnswer}
                onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                disabled={hasSubmitted && showResults}
                className={`inline-block w-auto min-w-[80px] h-6 text-xs text-center ${
                  feedback ? feedback.className : ''
                }`}
                style={{ 
                  width: `${Math.max(80, blank.word.length * 8 + (element.showLetterCount ? 20 : 0))}px`,
                  fontSize: `${12 * textScale}px`
                }}
                placeholder={element.showLetterCount ? `(${blank.word.length})` : '___'}
              />
              {showResults && hasSubmitted && (
                <span className="ml-1">
                  {feedback?.type === 'correct' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  ) : feedback?.type === 'close' ? (
                    <span className="text-xs text-yellow-600 inline">~</span>
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
                : 'Some answers need improvement'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
