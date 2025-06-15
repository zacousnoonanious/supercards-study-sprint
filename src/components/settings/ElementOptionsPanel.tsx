
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Settings } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementOptionsPanelProps {
  element: CanvasElement;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  element,
  onUpdateElement,
  onDelete,
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Element Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="element-x">X Position</Label>
          <Input
            id="element-x"
            type="number"
            value={element.x}
            onChange={(e) => onUpdateElement({ x: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="element-y">Y Position</Label>
          <Input
            id="element-y"
            type="number"
            value={element.y}
            onChange={(e) => onUpdateElement({ y: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="element-width">Width</Label>
          <Input
            id="element-width"
            type="number"
            value={element.width}
            onChange={(e) => onUpdateElement({ width: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="element-height">Height</Label>
          <Input
            id="element-height"
            type="number"
            value={element.height}
            onChange={(e) => onUpdateElement({ height: parseInt(e.target.value) || 0 })}
          />
        </div>

        {element.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="element-content">Content</Label>
            <Input
              id="element-content"
              value={element.content || ''}
              onChange={(e) => onUpdateElement({ content: e.target.value })}
            />
          </div>
        )}

        <Button
          onClick={onDelete}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Element
        </Button>
      </CardContent>
    </Card>
  );
};
