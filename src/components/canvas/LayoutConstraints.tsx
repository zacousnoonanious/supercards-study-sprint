
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Anchor, 
  Pin, 
  Maximize, 
  Lock, 
  Unlock,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight
} from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface LayoutConstraint {
  type: 'pin-to-edge' | 'scale-with-canvas' | 'fixed-distance' | 'anchor-to-element';
  edge?: 'top' | 'bottom' | 'left' | 'right' | 'center-x' | 'center-y';
  targetElementId?: string;
  distance?: number;
  scaleX?: boolean;
  scaleY?: boolean;
}

interface LayoutConstraintsProps {
  element: CanvasElement;
  onUpdateConstraints: (constraints: LayoutConstraint[]) => void;
  availableElements: CanvasElement[];
  isVisible: boolean;
  onToggle: () => void;
}

export const LayoutConstraints: React.FC<LayoutConstraintsProps> = ({
  element,
  onUpdateConstraints,
  availableElements,
  isVisible,
  onToggle,
}) => {
  const currentConstraints = (element as any).layoutConstraints || [];

  const addConstraint = (constraint: LayoutConstraint) => {
    const newConstraints = [...currentConstraints, constraint];
    onUpdateConstraints(newConstraints);
  };

  const removeConstraint = (index: number) => {
    const newConstraints = currentConstraints.filter((_: any, i: number) => i !== index);
    onUpdateConstraints(newConstraints);
  };

  const hasConstraint = (type: string) => {
    return currentConstraints.some((c: LayoutConstraint) => c.type === type);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="h-8 w-8 p-0"
        title="Layout Constraints"
      >
        <Anchor className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50 animate-scale-in min-w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Layout Constraints</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>

      <div className="space-y-3">
        {/* Pin to Edges */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Pin to Canvas Edges
          </label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'top') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'top'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'top' });
                }
              }}
              className="h-8"
            >
              <CornerUpLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'center-y') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'center-y'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'center-y' });
                }
              }}
              className="h-8"
            >
              <Pin className="w-4 h-4" />
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'bottom') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'bottom'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'bottom' });
                }
              }}
              className="h-8"
            >
              <CornerDownLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'left') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'left'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'left' });
                }
              }}
              className="h-8"
            >
              <Pin className="w-4 h-4 rotate-90" />
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'center-x') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'center-x'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'center-x' });
                }
              }}
              className="h-8"
            >
              <Pin className="w-4 h-4" />
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge') && currentConstraints.some((c: any) => c.edge === 'right') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.edge === 'right'));
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'right' });
                }
              }}
              className="h-8"
            >
              <Pin className="w-4 h-4 -rotate-90" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Scale with Canvas */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Scale with Canvas
          </label>
          <div className="flex gap-2">
            <Button
              variant={hasConstraint('scale-with-canvas') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('scale-with-canvas')) {
                  removeConstraint(currentConstraints.findIndex((c: any) => c.type === 'scale-with-canvas'));
                } else {
                  addConstraint({ type: 'scale-with-canvas', scaleX: true, scaleY: true });
                }
              }}
              className="h-8"
            >
              <Maximize className="w-4 h-4 mr-1" />
              Auto Scale
            </Button>
          </div>
        </div>

        <Separator />

        {/* Anchor to Element */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Anchor to Element
          </label>
          <Select
            onValueChange={(value) => {
              addConstraint({ 
                type: 'anchor-to-element', 
                targetElementId: value,
                distance: 20 
              });
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select element to anchor to" />
            </SelectTrigger>
            <SelectContent>
              {availableElements
                .filter(el => el.id !== element.id)
                .map(el => (
                  <SelectItem key={el.id} value={el.id}>
                    {el.type} - {el.content?.slice(0, 20) || 'Untitled'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Constraints List */}
        {currentConstraints.length > 0 && (
          <>
            <Separator />
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Active Constraints
              </label>
              <div className="space-y-1">
                {currentConstraints.map((constraint: LayoutConstraint, index: number) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <span>
                      {constraint.type === 'pin-to-edge' && `Pin to ${constraint.edge}`}
                      {constraint.type === 'scale-with-canvas' && 'Scale with canvas'}
                      {constraint.type === 'anchor-to-element' && `Anchored to element`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConstraint(index)}
                      className="h-4 w-4 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
