
import React from 'react';
import { Switch } from '@/components/ui/switch';
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

  // Memoize the change handler to prevent re-renders
  const handleCheckedChange = React.useCallback((checked: boolean) => {
    onShowBorderChange(checked);
  }, [onShowBorderChange]);

  return (
    <div className="flex items-center gap-2">
      <Square className="w-4 h-4" />
      <span className="text-sm">
        {showBorder ? t('editor.hideBorder') : t('editor.showBorder')}
      </span>
      <Switch
        checked={showBorder}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
};
