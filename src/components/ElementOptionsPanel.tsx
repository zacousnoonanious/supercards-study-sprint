
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, Palette, Type, Link, RotateCw, Image, Volume2, Video, Grid3X3, FileText, HelpCircle, Lock, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ElementOptionsPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
}) => {
  const { theme } = useTheme();

  // If selectedElement is 'canvas' string, show canvas options
  if (selectedElement === 'canvas' || selectedElement === null) {
    return (
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-medium">Canvas Settings</span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Label htmlFor="canvas-width" className="text-xs">Width:</Label>
            <Input
              id="canvas-width"
              type="number"
              value={canvasWidth}
              onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || canvasWidth, canvasHeight)}
              className="w-20 h-8 text-xs"
              min="400"
              max="2000"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="canvas-height" className="text-xs">Height:</Label>
            <Input
              id="canvas-height"
              type="number"
              value={canvasHeight}
              onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || canvasHeight)}
              className="w-20 h-8 text-xs"
              min="300"
              max="2000"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onCanvasSizeChange(900, 600)}
            className="text-xs"
          >
            Reset
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
        <div className="text-sm text-muted-foreground text-center">
          Select an element or canvas to edit its properties
        </div>
      </div>
    );
  }

  const getElementIcon = () => {
    switch (selectedElement.type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'youtube': return <Video className="w-4 h-4" />;
      case 'multiple-choice': return <HelpCircle className="w-4 h-4" />;
      case 'true-false': return <HelpCircle className="w-4 h-4" />;
      case 'fill-in-blank': return <FileText className="w-4 h-4" />;
      case 'deck-embed': return <Grid3X3 className="w-4 h-4" />;
      case 'drawing': return <Palette className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Element Type Icon and Delete */}
        <div className="flex items-center gap-2">
          {getElementIcon()}
          <span className="text-sm font-medium capitalize">{selectedElement.type.replace('-', ' ')}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Position Controls */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">X:</Label>
          <Input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 text-xs"
          />
          <Label className="text-xs">Y:</Label>
          <Input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 text-xs"
          />
        </div>

        {/* Size Controls */}
        <div className="flex items-center gap-2">
          <Label className="text-xs">W:</Label>
          <Input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 50 })}
            className="w-16 h-8 text-xs"
            min="10"
          />
          <Label className="text-xs">H:</Label>
          <Input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 30 })}
            className="w-16 h-8 text-xs"
            min="10"
          />
        </div>

        {/* Text-specific controls */}
        {selectedElement.type === 'text' && (
          <>
            <Separator orientation="vertical" className="h-6" />
            
            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Size:</Label>
              <Input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                className="w-16 h-8 text-xs"
                min="8"
                max="72"
              />
            </div>

            {/* Font Weight */}
            <Select value={selectedElement.fontWeight || 'normal'} onValueChange={(value) => onUpdateElement(selectedElement.id, { fontWeight: value })}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="lighter">Light</SelectItem>
              </SelectContent>
            </Select>

            {/* Text Color */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                className="w-12 h-8 p-1 border rounded"
              />
            </div>

            {/* Text Alignment */}
            <Select value={selectedElement.textAlign || 'left'} onValueChange={(value) => onUpdateElement(selectedElement.id, { textAlign: value })}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        {/* Rotation Control */}
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          <Input
            type="number"
            value={selectedElement.rotation || 0}
            onChange={(e) => onUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 text-xs"
            min="0"
            max="360"
          />
          <span className="text-xs">°</span>
        </div>

        {/* Hyperlink */}
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          <Input
            type="url"
            placeholder="Add link..."
            value={selectedElement.hyperlink || ''}
            onChange={(e) => onUpdateElement(selectedElement.id, { hyperlink: e.target.value })}
            className="w-32 h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
