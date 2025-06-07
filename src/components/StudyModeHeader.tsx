
import React from 'react';
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
  onGoBack?: () => void;
}

export const StudyModeHeader: React.FC<StudyModeHeaderProps> = ({
  set,
  currentIndex,
  totalCards,
  sessionStats,
  showSettings,
  onToggleSettings,
  onGoBack,
}) => {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {onGoBack && (
              <Button
                variant="ghost"
                onClick={onGoBack}
                className="mr-2 sm:mr-4 p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Go Back</span>
              </Button>
            )}
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-primary">{set.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Card {currentIndex + 1} of {totalCards} • Correct: {sessionStats.correct} • Incorrect: {sessionStats.incorrect}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSettings}
            className={`p-2 ${showSettings ? 'bg-secondary' : ''}`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Settings</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
