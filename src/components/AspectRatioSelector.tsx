
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CanvasElement } from '@/types/flashcard';

interface AspectRatioSelectorProps {
  element: CanvasElement;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  element,
  onUpdateElement,
}) => {
  const aspectRatios = [
    { label: '1:1', ratio: 1 },
    { label: '4:3', ratio: 4/3 },
    { label: '16:9', ratio: 16/9 },
    { label: '3:4', ratio: 3/4 },
    { label: '9:16', ratio: 9/16 },
  ];

  const handleAspectRatioChange = (ratio: number) => {
    const newHeight = element.width / ratio;
    onUpdateElement(element.id, { height: newHeight });
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">Aspect Ratio</Label>
      <div className="grid grid-cols-3 gap-2">
        {aspectRatios.map((ar) => (
          <Button
            key={ar.label}
            variant="outline"
            size="sm"
            onClick={() => handleAspectRatioChange(ar.ratio)}
            className="text-xs"
          >
            {ar.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
