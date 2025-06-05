
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
}

export const CardNavigation: React.FC<CardNavigationProps> = ({
  currentIndex,
  totalCards,
  onNavigate,
  currentSide,
  onSideChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('prev')}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          Card {currentIndex + 1} of {totalCards}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={currentIndex === totalCards - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={currentSide === 'front' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('front')}
        >
          Front
        </Button>
        <Button
          variant={currentSide === 'back' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('back')}
        >
          Back
        </Button>
      </div>
    </div>
  );
};
