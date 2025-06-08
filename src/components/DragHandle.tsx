
import React from 'react';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
  className?: string;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  onDragStart,
  onDragEnd,
  isDragging,
  className = ""
}) => {
  return (
    <div
      className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
      } ${className}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
    </div>
  );
};
