
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface CardNavigationButtonsProps {
  currentCardIndex: number;
  totalCards: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  className?: string;
}

export const CardNavigationButtons: React.FC<CardNavigationButtonsProps> = ({
  currentCardIndex,
  totalCards,
  onNavigate,
  className = "",
}) => {
  const { t } = useI18n();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate('prev')}
        disabled={currentCardIndex <= 0}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      <span className="text-sm text-muted-foreground px-2">
        {currentCardIndex + 1} / {totalCards}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate('next')}
        disabled={currentCardIndex >= totalCards - 1}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
