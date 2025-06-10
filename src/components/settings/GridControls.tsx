
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface GridControlsProps {
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onAutoFit?: () => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  showGrid = false,
  onShowGridChange,
  snapToGrid = false,
  onSnapToGridChange,
  zoom = 1,
  onZoomChange,
  onAutoFit,
}) => {
  const handleZoomIn = () => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoom * 1.2, 3));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoom * 0.8, 0.1));
    }
  };

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
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l pl-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            
            <span className="text-xs min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>

            {onAutoFit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAutoFit}
                className="h-7 w-7 p-0"
                title="Fit card to area"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
