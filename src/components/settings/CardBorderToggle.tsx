
import React, { useCallback } from 'react';
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

  console.log('🎛️ CardBorderToggle render:', {
    showBorder,
    hasHandler: !!onShowBorderChange,
    disabled
  });

  // Create a truly stable handler that won't cause re-renders
  // CRITICAL: Empty dependency array to prevent infinite loops
  const handleCheckedChange = useCallback((checked: boolean) => {
    console.log('🎛️ Border toggle clicked, new state:', checked);
    if (typeof checked === 'boolean' && typeof onShowBorderChange === 'function') {
      console.log('🎛️ Calling onShowBorderChange with:', checked);
      onShowBorderChange(checked);
    } else {
      console.error('❌ CardBorderToggle: Invalid parameters:', { checked, onShowBorderChange });
    }
  }, []); // FIXED: Empty dependencies to prevent infinite loops

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
