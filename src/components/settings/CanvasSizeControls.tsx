
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

  const handleWidthChange = (value: string) => {
    const width = parseInt(value) || 600;
    if (width >= 200 && width <= 2000) {
      onCanvasSizeChange(width, canvasHeight);
    }
  };

  const handleHeightChange = (value: string) => {
    const height = parseInt(value) || 450;
    if (height >= 200 && height <= 2000) {
      onCanvasSizeChange(canvasWidth, height);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium whitespace-nowrap">
        {t('editor.canvasSize')}
      </Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={canvasWidth}
          onChange={(e) => handleWidthChange(e.target.value)}
          className="w-16 h-8 text-xs"
          min="200"
          max="2000"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          type="number"
          value={canvasHeight}
          onChange={(e) => handleHeightChange(e.target.value)}
          className="w-16 h-8 text-xs"
          min="200"
          max="2000"
        />
      </div>
    </div>
  );
};
