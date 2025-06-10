
import React from 'react';
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface CardBorderToggleProps {
  showBorder: boolean;
  onShowBorderChange: (show: boolean) => void;
}

export const CardBorderToggle: React.FC<CardBorderToggleProps> = ({
  showBorder,
  onShowBorderChange,
}) => {
  const { t } = useI18n();

  return (
    <Button
      variant={showBorder ? "default" : "outline"}
      size="sm"
      onClick={() => onShowBorderChange(!showBorder)}
      className="flex items-center gap-2"
    >
      <Square className="w-4 h-4" />
      {showBorder ? t('editor.hideBorder') : t('editor.showBorder')}
    </Button>
  );
};
