
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/contexts/I18nContext';

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
  const { t } = useI18n();

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const width = parseInt(value) || 200;
    if (width >= 200 && width <= 2000) {
      onCanvasSizeChange(width, canvasHeight);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const height = parseInt(value) || 200;
    if (height >= 200 && height <= 2000) {
      onCanvasSizeChange(canvasWidth, height);
    }
  };

  const handleWidthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 600;
    const clampedValue = Math.max(200, Math.min(2000, value));
    if (clampedValue !== parseInt(e.target.value)) {
      onCanvasSizeChange(clampedValue, canvasHeight);
    }
  };

  const handleHeightBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 450;
    const clampedValue = Math.max(200, Math.min(2000, value));
    if (clampedValue !== parseInt(e.target.value)) {
      onCanvasSizeChange(canvasWidth, clampedValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium whitespace-nowrap">
        Canvas Size
      </Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={canvasWidth}
          onChange={handleWidthChange}
          onBlur={handleWidthBlur}
          className="w-16 h-8 text-xs"
          min="200"
          max="2000"
          step="10"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          type="number"
          value={canvasHeight}
          onChange={handleHeightChange}
          onBlur={handleHeightBlur}
          className="w-16 h-8 text-xs"
          min="200"
          max="2000"
          step="10"
        />
      </div>
    </div>
  );
};
