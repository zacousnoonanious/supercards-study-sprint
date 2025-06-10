
import React from 'react';
import { Button } from '@/components/ui/button';

interface CardSideToggleProps {
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  isBackDisabled?: boolean;
}

export const CardSideToggle: React.FC<CardSideToggleProps> = ({
  currentSide,
  onSideChange,
  isBackDisabled = false,
}) => {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded">
      <Button
        variant={currentSide === 'front' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('front')}
        className="h-7 px-3 text-xs"
      >
        Front
      </Button>
      <Button
        variant={currentSide === 'back' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('back')}
        className="h-7 px-3 text-xs"
        disabled={isBackDisabled}
      >
        Back
      </Button>
    </div>
  );
};
