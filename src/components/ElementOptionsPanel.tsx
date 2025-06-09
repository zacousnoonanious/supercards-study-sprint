
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { AdvancedCountdownSettings } from './AdvancedCountdownSettings';

interface ElementOptionsPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  cardType?: string;
  currentCard?: Flashcard;
  onUpdateCard?: (updates: Partial<Flashcard>) => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  cardType,
  currentCard,
  onUpdateCard,
}) => {
  if (!selectedElement && !currentCard) return null;

  return (
    <div className="fixed right-4 top-20 w-80 max-h-[calc(100vh-200px)] overflow-y-auto bg-background border rounded-lg shadow-lg z-50">
      {/* Card Settings Section */}
      {currentCard && onUpdateCard && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Card Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Canvas Size */}
            <div>
              <Label className="text-sm font-medium">Canvas Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-gray-500">Width</Label>
                  <Input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || 600, canvasHeight)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Height</Label>
                  <Input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || 450)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced Timer Settings */}
            <AdvancedCountdownSettings
              card={currentCard}
              onUpdateCard={onUpdateCard}
            />
          </CardContent>
        </Card>
      )}

      {/* Element Settings Section */}
      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Element Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Properties */}
            <div>
              <Label className="text-sm font-medium">Position & Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-gray-500">X Position</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Y Position</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Width</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Height</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Text Element Properties */}
            {selectedElement.type === 'text' && (
              <>
                <div>
                  <Label className="text-sm font-medium">Text Content</Label>
                  <Input
                    value={selectedElement.content || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="mt-1"
                    placeholder="Enter text content"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Text Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Label className="text-xs text-gray-500">Font Size</Label>
                      <Input
                        type="number"
                        value={selectedElement.fontSize || 16}
                        onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Color</Label>
                      <Input
                        type="color"
                        value={selectedElement.color || '#000000'}
                        onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Text Alignment</Label>
                  <Select
                    value={selectedElement.textAlign || 'left'}
                    onValueChange={(value) => onUpdateElement(selectedElement.id, { textAlign: value as 'left' | 'center' | 'right' | 'justify' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Image Element Properties */}
            {selectedElement.type === 'image' && (
              <div>
                <Label className="text-sm font-medium">Image URL</Label>
                <Input
                  value={selectedElement.imageUrl || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { imageUrl: e.target.value })}
                  className="mt-1"
                  placeholder="Enter image URL"
                />
              </div>
            )}

            {/* Multiple Choice Properties */}
            {selectedElement.type === 'multiple-choice' && (
              <>
                <div>
                  <Label className="text-sm font-medium">Question</Label>
                  <Input
                    value={selectedElement.content || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="mt-1"
                    placeholder="Enter question"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Quiz Settings</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedElement.showImmediateFeedback !== false}
                        onCheckedChange={(checked) => onUpdateElement(selectedElement.id, { showImmediateFeedback: checked })}
                      />
                      <Label className="text-xs">Show immediate feedback</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedElement.autoAdvanceOnAnswer === true}
                        onCheckedChange={(checked) => onUpdateElement(selectedElement.id, { autoAdvanceOnAnswer: checked })}
                      />
                      <Label className="text-xs">Auto advance on answer</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Answer Options</Label>
                  <div className="space-y-2 mt-1">
                    {(selectedElement.multipleChoiceOptions || []).map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(selectedElement.multipleChoiceOptions || [])];
                            newOptions[index] = e.target.value;
                            onUpdateElement(selectedElement.id, { multipleChoiceOptions: newOptions });
                          }}
                          className="flex-1 h-8"
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          variant={selectedElement.correctAnswer === index ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onUpdateElement(selectedElement.id, { correctAnswer: index })}
                          className="h-8 w-8 p-0"
                        >
                          ✓
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentOptions = selectedElement.multipleChoiceOptions || [];
                        const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
                        onUpdateElement(selectedElement.id, { multipleChoiceOptions: newOptions });
                      }}
                      className="w-full h-8"
                    >
                      + Add Option
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <Button
              variant="destructive"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="w-full"
            >
              Delete Element
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
