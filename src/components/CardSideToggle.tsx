
import React from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';

interface CardSideToggleProps {
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
}

export const CardSideToggle: React.FC<CardSideToggleProps> = ({
  currentSide,
  onSideChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
      <Button
        variant={currentSide === 'front' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('front')}
        className="h-7 px-3"
      >
        {t('editor.front')}
      </Button>
      <Button
        variant={currentSide === 'back' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onSideChange('back')}
        className="h-7 px-3"
      >
        {t('editor.back')}
      </Button>
    </div>
  );
};
