
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const [timeLeft, setTimeLeft] = useState(countdownTimer);
  const [isActive, setIsActive] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (countdownTimer > 0) {
      setTimeLeft(countdownTimer);
      setIsActive(true);
      // Force re-render of progress bar with new animation
      setAnimationKey(prev => prev + 1);
    } else {
      setIsActive(false);
    }
  }, [countdownTimer, currentIndex, showAnswer]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            onTimeUp?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border-t border-border p-4">
      <style>
        {`
          @keyframes slideProgress {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0%);
            }
          }
        `}
      </style>
      {countdownTimer > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span>Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              key={animationKey}
              className="h-full bg-primary rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                transform: 'translateX(-100%)',
                animation: isActive ? `slideProgress ${countdownTimer}s linear forwards` : 'none'
              }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={!allowNavigation || currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          
          <span className="text-sm font-medium px-3">
            {currentIndex + 1} / {totalCards}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={!allowNavigation || currentIndex === totalCards - 1}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onFlipCard}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{showAnswer ? 'Show Question' : 'Reveal Answer'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
