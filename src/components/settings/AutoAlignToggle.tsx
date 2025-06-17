
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlignCenter } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface AutoAlignToggleProps {
  autoAlign: boolean;
  onAutoAlignChange: (enabled: boolean) => void;
}

export const AutoAlignToggle: React.FC<AutoAlignToggleProps> = ({
  autoAlign,
  onAutoAlignChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center space-x-2">
      <AlignCenter className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="auto-align" className="text-sm font-medium cursor-pointer">
        Auto-align
      </Label>
      <Switch
        id="auto-align"
        checked={autoAlign}
        onCheckedChange={onAutoAlignChange}
      />
    </div>
  );
};
