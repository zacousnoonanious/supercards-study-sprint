
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageElementEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
}

export const ImageElementEditor: React.FC<ImageElementEditorProps> = ({
  element,
  onUpdate,
  textScale = 1
}) => {
  const { theme } = useTheme();
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({ imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (url: string) => {
    onUpdate({ imageUrl: url });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Image Preview */}
      <div 
        className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded mb-2 relative overflow-hidden"
        style={{
          opacity: element.opacity || 1,
          transform: `rotate(${element.rotation || 0}deg)`,
        }}
      >
        {element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            style={{
              borderWidth: element.borderWidth || 0,
              borderColor: element.borderColor || '#d1d5db',
              borderStyle: element.borderStyle || 'none',
            }}
            draggable={false}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p style={{ fontSize: `${12 * textScale}px` }}>No image selected</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card className="mt-auto">
        <CardContent className="p-2 space-y-2">
          <Tabs value={imageSource} onValueChange={(value) => setImageSource(value as 'upload' | 'url')}>
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
              <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-2 mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs"
                style={{ fontSize: `${10 * textScale}px` }}
              />
            </TabsContent>
            
            <TabsContent value="url" className="space-y-2 mt-2">
              <Input
                placeholder="Enter image URL"
                value={element.imageUrl || ''}
                onChange={(e) => handleUrlInput(e.target.value)}
                className="h-7 text-xs"
              />
            </TabsContent>
          </Tabs>

          {/* Opacity Control */}
          <div>
            <Label className="text-xs">Opacity: {Math.round((element.opacity || 1) * 100)}%</Label>
            <Slider
              value={[element.opacity || 1]}
              onValueChange={(values) => onUpdate({ opacity: values[0] })}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Control */}
          <div>
            <Label className="text-xs">Rotation: {element.rotation || 0}°</Label>
            <Slider
              value={[element.rotation || 0]}
              onValueChange={(values) => onUpdate({ rotation: values[0] })}
              min={0}
              max={360}
              step={15}
              className="w-full"
            />
          </div>

          {/* Border Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Border Style</Label>
              <Select
                value={element.borderStyle || 'none'}
                onValueChange={(value) => onUpdate({ borderStyle: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Border Width</Label>
              <Input
                type="number"
                value={element.borderWidth || 0}
                onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
                min="0"
                max="10"
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Border Color</Label>
            <Input
              type="color"
              value={element.borderColor || '#d1d5db'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              className="h-7 w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
