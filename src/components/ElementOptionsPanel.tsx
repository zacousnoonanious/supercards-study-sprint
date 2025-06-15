
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Link, Settings } from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { ElementLinkEditor } from './canvas-elements/ElementLinkEditor';

interface ElementOptionsPanelProps {
  element: CanvasElement;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  availableCards?: Flashcard[];
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  element,
  onUpdateElement,
  availableCards = [],
}) => {
  const [showLinkEditor, setShowLinkEditor] = useState(false);

  const handleBasicUpdate = (field: string, value: any) => {
    onUpdateElement(element.id, { [field]: value });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Element Options</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkEditor(true)}
          className="gap-2"
        >
          <Link className="w-3 h-3" />
          Link
        </Button>
      </div>

      <Separator />

      {/* Basic Properties */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="element-x" className="text-xs">X</Label>
            <Input
              id="element-x"
              type="number"
              value={element.x}
              onChange={(e) => handleBasicUpdate('x', Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="element-y" className="text-xs">Y</Label>
            <Input
              id="element-y"
              type="number"
              value={element.y}
              onChange={(e) => handleBasicUpdate('y', Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="element-width" className="text-xs">Width</Label>
            <Input
              id="element-width"
              type="number"
              value={element.width}
              onChange={(e) => handleBasicUpdate('width', Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="element-height" className="text-xs">Height</Label>
            <Input
              id="element-height"
              type="number"
              value={element.height}
              onChange={(e) => handleBasicUpdate('height', Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="element-rotation" className="text-xs">Rotation (°)</Label>
          <Input
            id="element-rotation"
            type="number"
            value={element.rotation || 0}
            onChange={(e) => handleBasicUpdate('rotation', Number(e.target.value))}
            className="h-8"
            min="0"
            max="360"
          />
        </div>

        <div>
          <Label htmlFor="element-zindex" className="text-xs">Layer (Z-Index)</Label>
          <Input
            id="element-zindex"
            type="number"
            value={element.zIndex || 0}
            onChange={(e) => handleBasicUpdate('zIndex', Number(e.target.value))}
            className="h-8"
          />
        </div>
      </div>

      {/* Link Status */}
      {element.linkData && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <Link className="w-3 h-3 text-blue-500" />
            <span className="text-blue-700">
              {element.linkData.type === 'card-jump' 
                ? 'Jumps to card' 
                : `Action: ${element.linkData.actionType}`}
            </span>
          </div>
        </div>
      )}

      {/* Link Editor Dialog */}
      {showLinkEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ElementLinkEditor
            element={element}
            availableCards={availableCards}
            onUpdateElement={onUpdateElement}
            onClose={() => setShowLinkEditor(false)}
          />
        </div>
      )}
    </div>
  );
};
