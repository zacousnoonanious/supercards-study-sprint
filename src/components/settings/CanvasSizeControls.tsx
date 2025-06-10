
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CanvasSizeControlsProps {
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
}

export const CanvasSizeControls: React.FC<CanvasSizeControlsProps> = ({
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
}) => {
  return (
    <Card className="flex-shrink-0">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Canvas Size:</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={canvasWidth}
              onChange={(e) => onCanvasSizeChange(Number(e.target.value), canvasHeight)}
              className="w-24 h-7 text-xs"
              min="200"
              max="2000"
            />
            <span className="text-xs">×</span>
            <Input
              type="number"
              value={canvasHeight}
              onChange={(e) => onCanvasSizeChange(canvasWidth, Number(e.target.value))}
              className="w-24 h-7 text-xs"
              min="150"
              max="2000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
