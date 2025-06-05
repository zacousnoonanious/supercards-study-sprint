import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Type, 
  Image, 
  Trash2, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Plus,
  CheckSquare,
  ToggleLeft,
  Youtube,
  BookOpen
} from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementToolbarProps {
  onAddElement: (type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'youtube' | 'deck-embed') => void;
  selectedElement: CanvasElement | null;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onCreateNewCard: () => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onCreateNewCard,
}) => {
  return (
    <div className="space-y-4">
      {/* Card Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Card Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={onCreateNewCard}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>
        </CardContent>
      </Card>

      {/* Add Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('text')}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('image')}
          >
            <Image className="w-4 h-4 mr-2" />
            Add Image
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('multiple-choice')}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Multiple Choice
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('true-false')}
          >
            <ToggleLeft className="w-4 h-4 mr-2" />
            True/False
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('youtube')}
          >
            <Youtube className="w-4 h-4 mr-2" />
            YouTube Video
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onAddElement('deck-embed')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Embed Deck
          </Button>
        </CardContent>
      </Card>

      {/* Element Properties */}
      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Element Properties
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteElement}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="x" className="text-xs">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => onUpdateElement({ x: parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="y" className="text-xs">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => onUpdateElement({ y: parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width" className="text-xs">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => onUpdateElement({ width: parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => onUpdateElement({ height: parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label htmlFor="rotation" className="text-xs">Rotation ({selectedElement.rotation}°)</Label>
              <Slider
                value={[selectedElement.rotation]}
                onValueChange={([value]) => onUpdateElement({ rotation: value })}
                max={360}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Text-specific properties */}
            {selectedElement.type === 'text' && (
              <>
                <div>
                  <Label htmlFor="content" className="text-xs">Text Content</Label>
                  <Textarea
                    id="content"
                    value={selectedElement.content || ''}
                    onChange={(e) => onUpdateElement({ content: e.target.value })}
                    className="h-20 text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) })}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color" className="text-xs">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => onUpdateElement({ color: e.target.value })}
                    className="h-8"
                  />
                </div>

                {/* Text Formatting */}
                <div>
                  <Label className="text-xs">Text Formatting</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ 
                        fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ 
                        fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ 
                        textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <Label className="text-xs">Text Alignment</Label>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ textAlign: 'left' })}
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ textAlign: 'center' })}
                    >
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ textAlign: 'right' })}
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'justify' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateElement({ textAlign: 'justify' })}
                    >
                      <AlignJustify className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Image-specific properties */}
            {selectedElement.type === 'image' && (
              <div>
                <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={selectedElement.imageUrl || ''}
                  onChange={(e) => onUpdateElement({ imageUrl: e.target.value })}
                  placeholder="Enter image URL"
                  className="h-8"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
