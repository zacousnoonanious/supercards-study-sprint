
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Grid3X3, Eye, EyeOff } from 'lucide-react';

interface GridControlsProps {
  /** Current state of grid visibility */
  showGrid?: boolean;
  /** Callback for grid visibility changes */
  onShowGridChange?: (show: boolean) => void;
  /** Current state of snap-to-grid functionality */
  snapToGrid?: boolean;
  /** Callback for snap-to-grid changes */
  onSnapToGridChange?: (snap: boolean) => void;
  /** Optional CSS classes */
  className?: string;
  /** Whether controls are disabled */
  disabled?: boolean;
}

/**
 * GridControls Component
 * 
 * Provides controls for grid visibility and snap-to-grid functionality.
 * Essential for precise element positioning in the visual editor.
 * 
 * Features:
 * - Toggle grid visibility for visual reference
 * - Enable/disable snap-to-grid for precise positioning
 * - Proper error handling and validation
 * 
 * @param showGrid - Current grid visibility state
 * @param onShowGridChange - Handler for grid visibility changes
 * @param snapToGrid - Current snap-to-grid state
 * @param onSnapToGridChange - Handler for snap-to-grid changes
 * @param className - Optional CSS classes
 * @param disabled - Whether controls should be disabled
 */
export const GridControls: React.FC<GridControlsProps> = ({
  showGrid = false,
  onShowGridChange,
  snapToGrid = false,
  onSnapToGridChange,
  className = "",
  disabled = false,
}) => {
  // Add comprehensive logging
  React.useEffect(() => {
    console.log('🎛️ GridControls props:', {
      showGrid,
      snapToGrid,
      hasGridHandler: !!onShowGridChange,
      hasSnapHandler: !!onSnapToGridChange,
      disabled
    });
  }, [showGrid, snapToGrid, onShowGridChange, onSnapToGridChange, disabled]);

  /**
   * Handle grid visibility toggle
   * Validates the callback exists before calling it
   */
  const handleGridToggle = React.useCallback(() => {
    console.log('🎛️ Grid toggle clicked, current state:', showGrid);
    if (onShowGridChange && typeof onShowGridChange === 'function') {
      const newState = !showGrid;
      console.log('🎛️ Calling onShowGridChange with:', newState);
      onShowGridChange(newState);
    } else {
      console.error('❌ GridControls: onShowGridChange callback not provided or invalid');
    }
  }, [showGrid, onShowGridChange]);

  /**
   * Handle snap-to-grid toggle
   * Validates input and callback before proceeding
   */
  const handleSnapToggle = React.useCallback((checked: boolean) => {
    console.log('🎛️ Snap toggle clicked, new state:', checked);
    if (typeof checked !== 'boolean') {
      console.error('❌ GridControls: Invalid boolean value for snap toggle:', checked);
      return;
    }
    
    if (onSnapToGridChange && typeof onSnapToGridChange === 'function') {
      console.log('🎛️ Calling onSnapToGridChange with:', checked);
      onSnapToGridChange(checked);
    } else {
      console.error('❌ GridControls: onSnapToGridChange callback not provided or invalid');
    }
  }, [onSnapToGridChange]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Grid Visibility Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={handleGridToggle}
          disabled={disabled}
          className="h-7 px-2 gap-1"
          aria-label={showGrid ? 'Hide grid' : 'Show grid'}
        >
          {showGrid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span className="text-xs">Grid</span>
        </Button>
      </div>
      
      {/* Snap to Grid Toggle */}
      <div className="flex items-center gap-2">
        <Label className="text-xs whitespace-nowrap" htmlFor="snap-toggle">
          Snap:
        </Label>
        <Switch
          id="snap-toggle"
          checked={snapToGrid}
          onCheckedChange={handleSnapToggle}
          disabled={disabled}
          className="scale-75"
          aria-label="Toggle snap to grid"
        />
      </div>
    </div>
  );
};
