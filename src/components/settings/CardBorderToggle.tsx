
import React, { useCallback, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Square } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface CardBorderToggleProps {
  /** Current state of the border visibility */
  showBorder: boolean;
  /** Callback function triggered when border visibility changes */
  onShowBorderChange: (show: boolean) => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * CardBorderToggle Component
 * 
 * Provides a toggle control for showing/hiding card borders in the visual editor.
 * This component is essential for the visual editing experience as it allows users
 * to see the boundaries of their cards clearly.
 */
export const CardBorderToggle: React.FC<CardBorderToggleProps> = ({
  showBorder,
  onShowBorderChange,
  className = "",
  disabled = false,
}) => {
  const { t } = useI18n();
  
  // Store the callback in a ref to avoid re-renders
  const callbackRef = useRef(onShowBorderChange);
  
  // Update the ref when the callback changes
  React.useEffect(() => {
    callbackRef.current = onShowBorderChange;
  }, [onShowBorderChange]);

  console.log('🎛️ CardBorderToggle render:', {
    showBorder,
    hasHandler: !!onShowBorderChange,
    disabled
  });

  // Create a completely stable handler that uses the ref
  const handleCheckedChange = useCallback((checked: boolean) => {
    console.log('🎛️ Border toggle clicked, new state:', checked);
    if (typeof checked === 'boolean' && typeof callbackRef.current === 'function') {
      console.log('🎛️ Calling onShowBorderChange with:', checked);
      callbackRef.current(checked);
    } else {
      console.error('❌ CardBorderToggle: Invalid parameters:', { checked, callback: callbackRef.current });
    }
  }, []); // Completely empty dependencies - using ref instead

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Square className="w-4 h-4" aria-hidden="true" />
      <span className="text-sm select-none">
        {showBorder ? t('editor.hideBorder') : t('editor.showBorder')}
      </span>
      <Switch
        checked={showBorder}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        aria-label={showBorder ? 'Hide card border' : 'Show card border'}
      />
    </div>
  );
};
