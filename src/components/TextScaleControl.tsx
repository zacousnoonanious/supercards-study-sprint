
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Type } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface TextScaleControlProps {
  textScale: number;
  onTextScaleChange: (scale: number) => void;
}

export const TextScaleControl: React.FC<TextScaleControlProps> = ({
  textScale,
  onTextScaleChange,
}) => {
  const handleDecrease = () => {
    const newScale = Math.max(0.5, textScale - 0.1);
    onTextScaleChange(Math.round(newScale * 10) / 10);
  };

  const handleIncrease = () => {
    const newScale = Math.min(2.0, textScale + 0.1);
    onTextScaleChange(Math.round(newScale * 10) / 10);
  };

  const handleReset = () => {
    onTextScaleChange(1.0);
  };

  return (
    <div className="flex items-center gap-2">
      <Type className="w-4 h-4 text-muted-foreground" />
      <Label className="text-sm font-medium">Text Scale:</Label>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          disabled={textScale <= 0.5}
          className="h-7 w-7 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-7 px-2 min-w-12 text-xs"
        >
          {Math.round(textScale * 100)}%
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={textScale >= 2.0}
          className="h-7 w-7 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
