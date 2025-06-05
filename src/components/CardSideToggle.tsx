
import React from 'react';
import { Button } from '@/components/ui/button';

interface CardSideToggleProps {
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  size?: 'sm' | 'default' | 'lg';
}

export const CardSideToggle: React.FC<CardSideToggleProps> = ({
  currentSide,
  onSideChange,
  size = 'default'
}) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
      <Button
        variant={currentSide === 'front' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onSideChange('front')}
        className="h-8 px-3 text-xs"
      >
        Front
      </Button>
      <Button
        variant={currentSide === 'back' ? 'default' : 'ghost'}
        size={size}
        onClick={() => onSideChange('back')}
        className="h-8 px-3 text-xs"
      >
        Back
      </Button>
    </div>
  );
};
