
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface StudyModeCardProps {
  card: {
    id: string;
    front_content: string;
    back_content: string;
    question: string;
    answer: string;
    hint?: string;
    front_elements: CanvasElement[];
    back_elements: CanvasElement[];
    card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
    interactive_type?: 'multiple-choice' | 'true-false' | 'fill-in-blank' | null;
  };
  showAnswer: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onAnswer: (correct: boolean) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  settings: {
    shuffle: boolean;
    autoFlip: boolean;
    countdownTimer: number;
    mode: 'flashcard' | 'quiz' | 'review';
  };
}

export const StudyModeCard: React.FC<StudyModeCardProps> = ({
  card,
  showAnswer,
  onFlip,
  onNext,
  onPrevious,
  onAnswer,
  canGoPrevious,
  canGoNext,
  settings,
}) => {
  const content = showAnswer ? (card.back_content || card.answer) : (card.front_content || card.question);

  return (
    <div className="space-y-6">
      <Card className="min-h-[400px] cursor-pointer" onClick={onFlip}>
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center space-y-4">
            <div className="text-lg leading-relaxed">{content}</div>
            {showAnswer && card.hint && (
              <div className="text-sm text-muted-foreground border-t pt-4">
                <strong>Hint:</strong> {card.hint}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {showAnswer ? 'Click to see question' : 'Click to reveal answer'}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onFlip}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip
          </Button>
          
          {settings.mode === 'quiz' && showAnswer && (
            <>
              <Button
                variant="outline"
                onClick={() => onAnswer(false)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Incorrect
              </Button>
              <Button
                variant="outline"
                onClick={() => onAnswer(true)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Check className="w-4 h-4 mr-2" />
                Correct
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
