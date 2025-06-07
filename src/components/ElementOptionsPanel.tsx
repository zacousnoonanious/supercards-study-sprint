
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
    <div className="w-full bg-white/90 backdrop-blur-sm border-b shadow-sm">
      <div className="px-4 py-2">
        <div className="flex items-center gap-6">
          <h3 className="font-medium text-sm whitespace-nowrap">Element Options</h3>
          
          {selectedElement && selectedElement !== 'canvas' && typeof selectedElement !== 'string' ? (
            <>
              {selectedElement.type === 'text' && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Content:</Label>
                    <Input
                      type="text"
                      value={selectedElement.content || ''}
                      onChange={(e) => handleTextUpdate('content', e.target.value)}
                      className="w-40 h-7 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Font Size:</Label>
                    <div className="w-20">
                      <Slider
                        defaultValue={[selectedElement.fontSize || 16]}
                        max={100}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{selectedElement.fontSize || 16}</span>
                  </div>
                </>
              )}

              {selectedElement.type === 'image' && (
                <div className="flex items-center gap-2">
                  <AspectRatioSelector
                    element={selectedElement}
                    onUpdateElement={onUpdateElement}
                  />
                </div>
              )}

              <Button variant="destructive" size="sm" onClick={handleDelete} className="h-7 px-2">
                <Trash2 className="w-3 h-3 mr-1" />
                <span className="text-xs">Delete</span>
              </Button>
            </>
          ) : null}

          {/* Canvas Size Controls - only show for normal cards */}
          {selectedElement === 'canvas' && cardType === 'normal' && onCanvasSizeChange && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Width:</Label>
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || canvasWidth, canvasHeight)}
                  min={400}
                  max={1200}
                  className="w-20 h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Height:</Label>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || canvasHeight)}
                  min={300}
                  max={2000}
                  className="w-20 h-7 text-xs"
                />
              </div>
            </>
          )}

          {/* Show card type info for constrained types */}
          {selectedElement === 'canvas' && cardType !== 'normal' && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-50 rounded border text-xs text-blue-700">
                {cardType === 'simple' && 'Simple cards: 600×900 fixed size'}
                {cardType === 'informational' && 'Info cards: 900×1800 fixed size'}
                <span className="ml-2 text-blue-600">({canvasWidth} × {canvasHeight})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
