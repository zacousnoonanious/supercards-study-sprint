
import React from 'react';
import { Button } from '@/components/ui/button';

interface CardSideToggleProps {
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  size?: 'sm' | 'md' | 'lg';
  isBackDisabled?: boolean;
}

export const CardSideToggle: React.FC<CardSideToggleProps> = ({
  currentSide,
  onSideChange,
  size = 'md',
  isBackDisabled = false,
}) => {
  const buttonClass = size === 'sm' ? 'h-7 px-3 text-xs' : size === 'lg' ? 'h-10 px-4' : 'h-8 px-3 text-sm';

  return (
    <div className="flex bg-muted rounded-md p-1">
      <Button
        variant={currentSide === 'front' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onSideChange('front')}
        className={buttonClass}
      >
        Front
      </Button>
      <Button
        variant={currentSide === 'back' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onSideChange('back')}
        className={buttonClass}
        disabled={isBackDisabled}
        title={isBackDisabled ? "Back side disabled for single-sided cards" : "Back side"}
      >
        Back
      </Button>
    </div>
  );
};
