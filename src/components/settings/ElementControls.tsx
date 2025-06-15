
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, RotateCcw } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementControlsProps {
  selectedElement: CanvasElement;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
}

export const ElementControls: React.FC<ElementControlsProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const handleReset = () => {
    onUpdateElement(selectedElement.id, {
      x: 100,
      y: 100,
      rotation: 0,
    });
  };

  const handleDelete = () => {
    onDeleteElement(selectedElement.id);
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
        onClick={handleDelete}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
