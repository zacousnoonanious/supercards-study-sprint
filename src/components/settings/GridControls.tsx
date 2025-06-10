
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';

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
  return (
    <Card className="flex-shrink-0">
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowGridChange?.(!showGrid)}
              className="h-7 px-2"
            >
              {showGrid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span className="ml-1 text-xs">Grid</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Snap:</Label>
            <Switch
              checked={snapToGrid}
              onCheckedChange={onSnapToGridChange}
              className="scale-75"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
