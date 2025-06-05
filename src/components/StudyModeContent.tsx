
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { Flashcard } from '@/types/flashcard';

interface StudyModeContentProps {
  currentCard: Flashcard;
  showPanelView: boolean;
  showAnswer: boolean;
  showHint: boolean;
  onRevealAnswer: () => void;
  onToggleHint: () => void;
  onAnswer: (correct: boolean) => void;
  onFlipCard: () => void;
}

export const StudyModeContent: React.FC<StudyModeContentProps> = ({
  currentCard,
  showPanelView,
  showAnswer,
  showHint,
  onRevealAnswer,
  onToggleHint,
  onAnswer,
  onFlipCard,
}) => {
  if (showPanelView) {
    return (
      <>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Question</h3>
          <StudyCardRenderer elements={currentCard.front_elements} className="mx-auto max-w-full sm:max-w-2xl" />
        </div>
        
        {currentCard.hint && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
              className="text-primary"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                <strong>Hint:</strong> {currentCard.hint}
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          {!showAnswer ? (
            <Button onClick={onRevealAnswer} size="lg" className="w-full sm:w-auto">
              Reveal Answer
            </Button>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Answer</h3>
                <StudyCardRenderer elements={currentCard.back_elements} className="mx-auto max-w-full sm:max-w-2xl" />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Button
                  onClick={() => onAnswer(false)}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                >
                  <XCircle className="w-4 h-4" />
                  Incorrect
                </Button>
                <Button
                  onClick={() => onAnswer(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                >
                  <CheckCircle className="w-4 h-4" />
                  Correct
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
      <div className="relative mx-auto max-w-full sm:max-w-2xl" style={{ perspective: '1000px' }}>
        <div 
          className={`relative w-full transition-transform duration-700 preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="absolute w-full backface-hidden">
            <StudyCardRenderer elements={currentCard.front_elements} className="w-full" />
          </div>
          
          <div className="absolute w-full backface-hidden rotate-y-180">
            <StudyCardRenderer elements={currentCard.back_elements} className="w-full" />
          </div>
        </div>
      </div>

      {currentCard.hint && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHint}
            className="text-primary"
          >
            {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          {showHint && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
              <strong>Hint:</strong> {currentCard.hint}
            </div>
          )}
        </div>
      )}

      {showAnswer && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          <Button
            onClick={() => onAnswer(false)}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
          >
            <XCircle className="w-4 h-4" />
            Incorrect
          </Button>
          <Button
            onClick={() => onAnswer(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
          >
            <CheckCircle className="w-4 h-4" />
            Correct
          </Button>
        </div>
      )}
    </div>
  );
};
