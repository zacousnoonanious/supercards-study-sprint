
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { FlashcardSet } from '@/types/flashcard';

interface StudyModeHeaderProps {
  set: FlashcardSet;
  setId: string;
  currentIndex: number;
  totalCards: number;
  sessionStats: { correct: number; incorrect: number };
  showSettings: boolean;
  onToggleSettings: () => void;
}

export const StudyModeHeader: React.FC<StudyModeHeaderProps> = ({
  set,
  setId,
  currentIndex,
  totalCards,
  sessionStats,
  showSettings,
  onToggleSettings,
}) => {
  const navigate = useNavigate();
  const progress = ((currentIndex + 1) / totalCards) * 100;

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-2 sm:mr-4 p-2 flex-shrink-0"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Set</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Study: {set.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {totalCards}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSettings}
                className="flex-shrink-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground text-right flex-shrink-0">
                <div className="hidden sm:block">
                  Correct: {sessionStats.correct} | Incorrect: {sessionStats.incorrect}
                </div>
                <div className="sm:hidden">
                  {sessionStats.correct}/{sessionStats.incorrect}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full bg-muted h-1">
        <div 
          className="bg-primary h-1 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
};
