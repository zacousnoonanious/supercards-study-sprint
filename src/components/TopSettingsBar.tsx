
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, Type } from 'lucide-react';

interface TopSettingsBarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const TopSettingsBar: React.FC<TopSettingsBarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  currentCard,
  onUpdateCard,
}) => {
  const handleCanvasWidthChange = (value: string) => {
    const width = parseInt(value);
    if (!isNaN(width) && width > 0) {
      onCanvasSizeChange(width, canvasHeight);
    }
  };

  const handleCanvasHeightChange = (value: string) => {
    const height = parseInt(value);
    if (!isNaN(height) && height > 0) {
      onCanvasSizeChange(canvasWidth, height);
    }
  };

  const handleElementUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  const toggleBold = () => {
    if (selectedElement?.type === 'text') {
      const currentWeight = selectedElement.fontWeight || 'normal';
      handleElementUpdate({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
    }
  };

  const toggleItalic = () => {
    if (selectedElement?.type === 'text') {
      const currentStyle = selectedElement.fontStyle || 'normal';
      handleElementUpdate({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
    }
  };

  const toggleUnderline = () => {
    if (selectedElement?.type === 'text') {
      const currentDecoration = selectedElement.textDecoration || 'none';
      handleElementUpdate({ textDecoration: currentDecoration === 'underline' ? 'none' : 'underline' });
    }
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (selectedElement?.type === 'text') {
      handleElementUpdate({ textAlign: alignment });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-12">
      {/* Canvas Size Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="canvas-width" className="text-sm whitespace-nowrap">Width:</Label>
          <Input
            id="canvas-width"
            type="number"
            value={canvasWidth}
            onChange={(e) => handleCanvasWidthChange(e.target.value)}
            className="w-20 h-8 text-sm"
            min="200"
            max="2000"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="canvas-height" className="text-sm whitespace-nowrap">Height:</Label>
          <Input
            id="canvas-height"
            type="number"
            value={canvasHeight}
            onChange={(e) => handleCanvasHeightChange(e.target.value)}
            className="w-20 h-8 text-sm"
            min="200"
            max="2000"
          />
        </div>
      </div>

      {/* Element-specific controls */}
      {selectedElement && (
        <>
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center space-x-2">
            {selectedElement.type === 'text' && (
              <>
                {/* Font Size */}
                <div className="flex items-center space-x-1">
                  <Type className="w-4 h-4" />
                  <Input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => handleElementUpdate({ fontSize: parseInt(e.target.value) || 16 })}
                    className="w-16 h-8 text-sm"
                    min="8"
                    max="72"
                  />
                </div>

                <Separator orientation="vertical" className="h-4" />

                {/* Text Formatting */}
                <Button
                  variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleBold}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleItalic}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleUnderline}
                  className="h-8 w-8 p-0"
                >
                  <Underline className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="h-4" />

                {/* Text Alignment */}
                <Button
                  variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlignment('left')}
                  className="h-8 w-8 p-0"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlignment('center')}
                  className="h-8 w-8 p-0"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                
                <Button
                  variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAlignment('right')}
                  className="h-8 w-8 p-0"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="h-4" />

                {/* Text Color */}
                <div className="flex items-center space-x-1">
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => handleElementUpdate({ color: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Element positioning for all types */}
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-2">
              <Label className="text-xs">X:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleElementUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-16 h-8 text-sm"
              />
              
              <Label className="text-xs">Y:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleElementUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-16 h-8 text-sm"
              />
              
              <Label className="text-xs">W:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleElementUpdate({ width: parseInt(e.target.value) || 50 })}
                className="w-16 h-8 text-sm"
              />
              
              <Label className="text-xs">H:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleElementUpdate({ height: parseInt(e.target.value) || 30 })}
                className="w-16 h-8 text-sm"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
