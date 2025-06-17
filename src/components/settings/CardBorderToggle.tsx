
import React from 'react';
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
 * 
 * @param showBorder - Current border visibility state
 * @param onShowBorderChange - Handler for border visibility changes
 * @param className - Optional CSS classes for styling
 * @param disabled - Whether the toggle should be disabled
 */
export const CardBorderToggle: React.FC<CardBorderToggleProps> = ({
  showBorder,
  onShowBorderChange,
  className = "",
  disabled = false,
}) => {
  const { t } = useI18n();

  // Memoize the change handler to prevent unnecessary re-renders
  const handleCheckedChange = React.useCallback((checked: boolean) => {
    // Validate input before calling the handler
    if (typeof checked === 'boolean') {
      onShowBorderChange(checked);
    } else {
      console.warn('CardBorderToggle: Invalid boolean value received:', checked);
    }
  }, [onShowBorderChange]);

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
