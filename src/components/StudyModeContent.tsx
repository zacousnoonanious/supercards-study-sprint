
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
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Question</h3>
          <div className="flex justify-center">
            <StudyCardRenderer elements={currentCard.front_elements} />
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

        <div className="text-center">
          {!showAnswer ? (
            <Button onClick={onRevealAnswer} size="lg" className="w-full sm:w-auto">
              Reveal Answer
            </Button>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Answer</h3>
                <div className="flex justify-center">
                  <StudyCardRenderer elements={currentCard.back_elements} />
                </div>
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-center space-y-6">
      <div className="flex justify-center" style={{ perspective: '1000px' }}>
        <div 
          className={`relative transition-transform duration-700 preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="backface-hidden">
            <StudyCardRenderer elements={currentCard.front_elements} />
          </div>
          
          <div className="absolute top-0 left-0 backface-hidden rotate-y-180">
            <StudyCardRenderer elements={currentCard.back_elements} />
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
