
import React from 'react';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DraggableCardHeaderProps {
  cardIndex: number;
  cardType: string;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
}

export const DraggableCardHeader: React.FC<DraggableCardHeaderProps> = ({
  cardIndex,
  cardType,
  onDragStart,
  onDragEnd,
  isDragging
}) => {
  return (
    <div 
      className="flex items-center justify-between mb-2 group cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart(e, cardIndex)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center gap-2">
        <GripVertical 
          className={`w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${
            isDragging ? 'opacity-100' : ''
          }`}
        />
        <Badge variant="outline" className="text-xs">
          Card {cardIndex + 1}
        </Badge>
      </div>
      {cardType !== 'normal' && (
        <Badge variant="secondary" className="text-xs capitalize">
          {cardType.replace('-', ' ')}
        </Badge>
      )}
    </div>
  );
};
