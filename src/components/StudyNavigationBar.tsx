import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface StudyNavigationBarProps {
  currentIndex: number;
  totalCards: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onFlipCard: () => void;
  showAnswer: boolean;
  countdownTimer?: number;
  onTimeUp?: () => void;
  allowNavigation?: boolean;
}

export const StudyNavigationBar: React.FC<StudyNavigationBarProps> = ({
  currentIndex,
  totalCards,
  onNavigate,
  onFlipCard,
  showAnswer,
  countdownTimer = 0,
  onTimeUp,
  allowNavigation = true,
}) => {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(countdownTimer);

  useEffect(() => {
    if (countdownTimer > 0) {
      setTimeLeft(countdownTimer);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdownTimer, onTimeUp]);

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={() => onNavigate('prev')}
          disabled={!allowNavigation || currentIndex <= 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('study.previousCard')}
        </Button>

        {/* Center: Card Counter and Front/Back Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
          </span>
          
          {/* Single Toggleable Front/Back Button */}
          <Button
            variant={showAnswer ? "default" : "outline"}
            onClick={onFlipCard}
            className="flex items-center gap-2 min-w-[100px]"
          >
            <RotateCcw className="w-4 h-4" />
            {t(showAnswer ? 'setView.back' : 'setView.front')}
          </Button>

          {countdownTimer > 0 && timeLeft > 0 && (
            <div className="text-sm text-muted-foreground">
              {t('study.secondsLeft', { count: timeLeft })}
            </div>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={() => onNavigate('next')}
          disabled={!allowNavigation || currentIndex >= totalCards - 1}
          className="flex items-center gap-2"
        >
          {t('study.nextCard')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
