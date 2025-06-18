
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

  // Use a ref to store the latest handler to avoid dependency issues
  const handlerRef = React.useRef(onAutoAlignChange);
  
  // Update the ref when the handler changes
  React.useEffect(() => {
    handlerRef.current = onAutoAlignChange;
  }, [onAutoAlignChange]);

  // Create a stable handler that doesn't change on every render
  const handleCheckedChange = useCallback((checked: boolean) => {
    if (typeof handlerRef.current === 'function') {
      handlerRef.current(checked);
    }
  }, []); // Empty dependency array makes this truly stable

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
