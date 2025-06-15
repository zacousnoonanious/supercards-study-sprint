
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, RotateCcw } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementControlsProps {
  element: CanvasElement;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export const ElementControls: React.FC<ElementControlsProps> = ({
  element,
  onUpdateElement,
  onDelete,
}) => {
  const handleReset = () => {
    onUpdateElement({
      x: 100,
      y: 100,
      rotation: 0,
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={onDelete}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
