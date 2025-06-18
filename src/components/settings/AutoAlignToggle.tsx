
import React, { useCallback, useRef } from 'react';
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
  
  // Store the callback in a ref to avoid re-renders
  const callbackRef = useRef(onAutoAlignChange);
  
  // Update the ref when the callback changes
  React.useEffect(() => {
    callbackRef.current = onAutoAlignChange;
  }, [onAutoAlignChange]);

  console.log('🎛️ AutoAlignToggle render:', {
    autoAlign,
    hasHandler: !!onAutoAlignChange
  });

  // Create a completely stable handler that uses the ref
  const handleCheckedChange = useCallback((checked: boolean) => {
    console.log('🎛️ Auto-align toggle clicked, new state:', checked);
    if (typeof checked === 'boolean' && typeof callbackRef.current === 'function') {
      console.log('🎛️ Calling onAutoAlignChange with:', checked);
      callbackRef.current(checked);
    } else {
      console.error('❌ AutoAlignToggle: Invalid parameters:', { checked, callback: callbackRef.current });
    }
  }, []); // Completely empty dependencies - using ref instead

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
