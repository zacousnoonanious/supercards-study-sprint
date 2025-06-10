
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Grid3X3, Eye, EyeOff } from 'lucide-react';

interface GridControlsProps {
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  showGrid = false,
  onShowGridChange,
  snapToGrid = false,
  onSnapToGridChange,
}) => {
  const handleGridToggle = () => {
    if (onShowGridChange) {
      onShowGridChange(!showGrid);
    }
  };

  const handleSnapToggle = (checked: boolean) => {
    if (onSnapToGridChange) {
      onSnapToGridChange(checked);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant={showGrid ? "default" : "outline"}
          size="sm"
          onClick={handleGridToggle}
          className="h-7 px-2 gap-1"
        >
          {showGrid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span className="text-xs">Grid</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs whitespace-nowrap">Snap:</Label>
        <Switch
          checked={snapToGrid}
          onCheckedChange={handleSnapToggle}
          className="scale-75"
        />
      </div>
    </div>
  );
};
