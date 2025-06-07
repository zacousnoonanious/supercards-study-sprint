
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Type, Link, Upload, Palette } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementPopupToolbarProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}

export const ElementPopupToolbar: React.FC<ElementPopupToolbarProps> = ({
  element,
  onUpdate,
  onClose,
}) => {
  const isTextElement = element.type === 'text';

  const handleFontSizeChange = (size: number) => {
    onUpdate({ fontSize: size });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleStyleToggle = (style: 'bold' | 'italic' | 'underline') => {
    switch (style) {
      case 'bold':
        onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' });
        break;
      case 'italic':
        onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' });
        break;
      case 'underline':
        onUpdate({ 
          textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
        });
        break;
    }
  };

  const handleHyperlinkChange = (url: string) => {
    onUpdate({ hyperlink: url });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (element.type === 'image') {
          onUpdate({ imageUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Popover open={true} onOpenChange={() => onClose()}>
      <PopoverTrigger asChild>
        <div />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="top">
        <div className="space-y-4">
          {/* Text formatting options */}
          {isTextElement && (
            <>
              <div>
                <Label className="text-sm font-medium">Text Formatting</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStyleToggle('bold')}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStyleToggle('italic')}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStyleToggle('underline')}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-sm">Font Size</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Type className="w-4 h-4" />
                    <Input
                      type="number"
                      value={element.fontSize || 16}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                      className="w-20 h-8"
                      min="8"
                      max="72"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <Label className="text-sm">Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Palette className="w-4 h-4" />
                    <Input
                      type="color"
                      value={element.color || '#000000'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-16 h-8 p-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Hyperlink option for image elements only */}
          {element.type === 'image' && (
            <div>
              <Label className="text-sm font-medium">Hyperlink</Label>
              <div className="flex items-center gap-2 mt-2">
                <Link className="w-4 h-4" />
                <Input
                  placeholder="Enter URL (https://...)"
                  value={element.hyperlink || ''}
                  onChange={(e) => handleHyperlinkChange(e.target.value)}
                  className="flex-1 h-8"
                />
              </div>
            </div>
          )}

          {/* Upload option for image elements */}
          {element.type === 'image' && (
            <div>
              <Label className="text-sm font-medium">Upload Image</Label>
              <div className="flex items-center gap-2 mt-2">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1 text-sm"
                />
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full" size="sm">
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
