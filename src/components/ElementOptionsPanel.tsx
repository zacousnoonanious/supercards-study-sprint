import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/types/flashcard';
import { AspectRatioSelector } from './AspectRatioSelector';

interface ElementOptionsPanelProps {
  selectedElement: CanvasElement | string | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange?: (width: number, height: number) => void;
  cardType?: string;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  cardType = 'normal',
}) => {
  const handleTextUpdate = useCallback((field: string, value: string | number) => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    onUpdateElement(selectedElement.id, { [field]: value });
  }, [selectedElement, onUpdateElement]);

  const handleSliderChange = useCallback((value: number[]) => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    onUpdateElement(selectedElement.id, { fontSize: value[0] });
  }, [selectedElement, onUpdateElement]);

  const handleDelete = useCallback(() => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    onDeleteElement(selectedElement.id);
  }, [selectedElement, onDeleteElement]);

  return (
    <Card className="w-80 bg-white/90 backdrop-blur-sm border shadow-sm">
      <CardHeader>
        <CardTitle>Element Options</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {selectedElement && selectedElement !== 'canvas' && typeof selectedElement !== 'string' ? (
          <>
            {selectedElement.type === 'text' && (
              <div className="space-y-4">
                <h3 className="font-medium">Text Properties</h3>
                <div className="space-y-2">
                  <Label className="text-sm">Content</Label>
                  <Input
                    type="text"
                    value={selectedElement.content || ''}
                    onChange={(e) => handleTextUpdate('content', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Font Size</Label>
                  <Slider
                    defaultValue={[selectedElement.fontSize || 16]}
                    max={100}
                    step={1}
                    onValueChange={handleSliderChange}
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'image' && (
              <div className="space-y-4">
                <h3 className="font-medium">Image Properties</h3>
                <AspectRatioSelector
                  element={selectedElement}
                  onUpdateElement={onUpdateElement}
                />
              </div>
            )}

            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Element
            </Button>
          </>
        ) : null}

      {/* Canvas Size Controls - only show for normal cards */}
      {selectedElement === 'canvas' && cardType === 'normal' && onCanvasSizeChange && (
        <div className="space-y-4">
          <h3 className="font-medium">Canvas Size</h3>
          <div className="space-y-2">
            <div>
              <Label className="text-sm">Width</Label>
              <Input
                type="number"
                value={canvasWidth}
                onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || canvasWidth, canvasHeight)}
                min={400}
                max={1200}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm">Height</Label>
              <Input
                type="number"
                value={canvasHeight}
                onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || canvasHeight)}
                min={300}
                max={2000}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Show card type info for constrained types */}
      {selectedElement === 'canvas' && cardType !== 'normal' && (
        <div className="space-y-4">
          <h3 className="font-medium">Canvas Settings</h3>
          <div className="p-3 bg-blue-50 rounded border">
            <p className="text-sm text-blue-700">
              {cardType === 'simple' && 'Simple cards have a fixed 600×900 size and single text elements.'}
              {cardType === 'informational' && 'Informational cards have a fixed 900×1800 size for detailed content.'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Current size: {canvasWidth} × {canvasHeight}
            </p>
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  );
};
