
import React, { useCallback } from 'react';
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

  console.log('🎛️ AutoAlignToggle render:', {
    autoAlign,
    hasHandler: !!onAutoAlignChange
  });

  // Create a truly stable handler that won't cause re-renders
  // CRITICAL: Empty dependency array to prevent infinite loops
  const handleCheckedChange = useCallback((checked: boolean) => {
    console.log('🎛️ Auto-align toggle clicked, new state:', checked);
    if (typeof checked === 'boolean' && typeof onAutoAlignChange === 'function') {
      console.log('🎛️ Calling onAutoAlignChange with:', checked);
      onAutoAlignChange(checked);
    } else {
      console.error('❌ AutoAlignToggle: Invalid parameters:', { checked, onAutoAlignChange });
    }
  }, []); // FIXED: Empty dependencies to prevent infinite loops

  return (
    <div className="flex items-center space-x-2">
      <AlignCenter className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="auto-align" className="text-sm font-medium cursor-pointer">
        Auto-align
      </Label>
      <Switch
        id="auto-align"
        checked={autoAlign}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
};
