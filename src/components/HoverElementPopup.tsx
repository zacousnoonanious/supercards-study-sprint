
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { CanvasElement } from '@/types/flashcard';

interface HoverElementPopupProps {
  element: CanvasElement;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  isSelected: boolean;
}

export const HoverElementPopup: React.FC<HoverElementPopupProps> = ({
  element,
  position,
  onUpdate,
  onDelete,
  isSelected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSelected) return null;

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        zIndex: 100,
      }}
    >
      {/* Collapsed state - just a small settings icon */}
      {!isExpanded && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
              title="Expand settings"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              title="Delete element"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded state - full settings panel */}
      {isExpanded && (
        <div className="relative">
          <div className="absolute top-0 right-0 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
              title="Collapse settings"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
          </div>
          <ElementPopupToolbar
            element={element}
            onUpdate={onUpdate}
            onDelete={onDelete}
            position={{ x: 0, y: 0 }}
          />
        </div>
      )}
    </div>
  );
};
