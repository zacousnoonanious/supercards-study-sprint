import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Anchor, 
  Pin, 
  Maximize, 
  Lock, 
  Unlock,
  Move
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
  canvasWidth: number;
  canvasHeight: number;
  onApplyConstraints: () => void;
}

export const LayoutConstraints: React.FC<LayoutConstraintsProps> = ({
  element,
  onUpdateConstraints,
  availableElements,
  isVisible,
  onToggle,
  canvasWidth,
  canvasHeight,
  onApplyConstraints,
}) => {
  const currentConstraints = (element as any).layoutConstraints || [];
  const panelRef = useRef<HTMLDivElement>(null);

  // Apply constraints immediately when they change
  useEffect(() => {
    if (currentConstraints.length > 0) {
      onApplyConstraints();
    }
  }, [currentConstraints, onApplyConstraints]);

  const addConstraint = (constraint: LayoutConstraint) => {
    // Remove existing constraints of the same type to avoid conflicts
    const filteredConstraints = currentConstraints.filter((c: LayoutConstraint) => {
      if (constraint.type === 'pin-to-edge' && c.type === 'pin-to-edge') {
        return c.edge !== constraint.edge;
      }
      return c.type !== constraint.type;
    });
    
    const newConstraints = [...filteredConstraints, constraint];
    onUpdateConstraints(newConstraints);
  };

  const removeConstraint = (index: number) => {
    const newConstraints = currentConstraints.filter((_: any, i: number) => i !== index);
    onUpdateConstraints(newConstraints);
  };

  const hasConstraint = (type: string, edge?: string) => {
    return currentConstraints.some((c: LayoutConstraint) => {
      if (edge) {
        return c.type === type && c.edge === edge;
      }
      return c.type === type;
    });
  };

  const clearAllConstraints = () => {
    onUpdateConstraints([]);
  };

  // Calculate menu position to keep it on canvas
  const getMenuPosition = () => {
    const baseLeft = element.x + element.width + 10;
    const baseTop = element.y;
    const menuWidth = 320; // Approximate menu width
    const menuHeight = 400; // Approximate menu height

    let left = baseLeft;
    let top = baseTop;

    // Keep menu within canvas bounds
    if (left + menuWidth > canvasWidth) {
      left = element.x - menuWidth - 10;
    }
    if (left < 0) {
      left = 10;
    }
    if (top + menuHeight > canvasHeight) {
      top = canvasHeight - menuHeight - 10;
    }
    if (top < 0) {
      top = 10;
    }

    return { left, top };
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

  const menuPosition = getMenuPosition();

  return (
    <div 
      ref={panelRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50 animate-scale-in min-w-80 max-w-80"
      style={{
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Layout Constraints</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllConstraints}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            title="Clear all constraints"
          >
            <Unlock className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {/* Pin to Edges */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
            Pin to Canvas Edges
          </label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={hasConstraint('pin-to-edge', 'top') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'top')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'top');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'top' });
                }
              }}
              className="h-8 text-xs"
              title="Pin to Top"
            >
              <Pin className="w-3 h-3" />
              T
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge', 'center-y') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'center-y')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'center-y');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'center-y' });
                }
              }}
              className="h-8 text-xs"
              title="Center Vertically"
            >
              <Pin className="w-3 h-3" />
              ⊞
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge', 'bottom') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'bottom')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'bottom');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'bottom' });
                }
              }}
              className="h-8 text-xs"
              title="Pin to Bottom"
            >
              <Pin className="w-3 h-3 rotate-180" />
              B
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge', 'left') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'left')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'left');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'left' });
                }
              }}
              className="h-8 text-xs"
              title="Pin to Left"
            >
              <Pin className="w-3 h-3 rotate-90" />
              L
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge', 'center-x') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'center-x')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'center-x');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'center-x' });
                }
              }}
              className="h-8 text-xs"
              title="Center Horizontally"
            >
              <Pin className="w-3 h-3" />
              ⊟
            </Button>
            <Button
              variant={hasConstraint('pin-to-edge', 'right') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (hasConstraint('pin-to-edge', 'right')) {
                  const index = currentConstraints.findIndex((c: any) => c.type === 'pin-to-edge' && c.edge === 'right');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'pin-to-edge', edge: 'right' });
                }
              }}
              className="h-8 text-xs"
              title="Pin to Right"
            >
              <Pin className="w-3 h-3 -rotate-90" />
              R
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
                  const index = currentConstraints.findIndex((c: any) => c.type === 'scale-with-canvas');
                  removeConstraint(index);
                } else {
                  addConstraint({ type: 'scale-with-canvas', scaleX: true, scaleY: true });
                }
              }}
              className="h-8 flex-1"
              title="Element will scale proportionally with canvas resize"
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
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
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
                Active Constraints ({currentConstraints.length})
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {currentConstraints.map((constraint: LayoutConstraint, index: number) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-green-500" />
                      {constraint.type === 'pin-to-edge' && `Pin to ${constraint.edge?.replace('-', ' ')}`}
                      {constraint.type === 'scale-with-canvas' && 'Scale with canvas'}
                      {constraint.type === 'anchor-to-element' && `Anchored to element`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConstraint(index)}
                      className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                      title="Remove constraint"
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
