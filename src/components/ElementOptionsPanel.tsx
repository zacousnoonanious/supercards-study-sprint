
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/types/flashcard';
import { AspectRatioSelector } from './AspectRatioSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleStyleToggle = useCallback((style: 'bold' | 'italic' | 'underline') => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    
    switch (style) {
      case 'bold':
        onUpdateElement(selectedElement.id, { 
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
        });
        break;
      case 'italic':
        onUpdateElement(selectedElement.id, { 
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
        });
        break;
      case 'underline':
        onUpdateElement(selectedElement.id, { 
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
        });
        break;
    }
  }, [selectedElement, onUpdateElement]);

  const handleAlignmentChange = useCallback((alignment: 'left' | 'center' | 'right') => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    onUpdateElement(selectedElement.id, { textAlign: alignment });
  }, [selectedElement, onUpdateElement]);

  const handleFontFamilyChange = useCallback((fontFamily: string) => {
    if (typeof selectedElement === 'string' || !selectedElement) return;
    onUpdateElement(selectedElement.id, { fontFamily });
  }, [selectedElement, onUpdateElement]);

  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm border-b shadow-sm">
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="font-medium text-sm whitespace-nowrap">Element Options</h3>
          
          {/* Canvas Size Controls - Always show */}
          {onCanvasSizeChange && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Canvas Width:</Label>
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || canvasWidth, canvasHeight)}
                  min={200}
                  max={2000}
                  className="w-20 h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Canvas Height:</Label>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || canvasHeight)}
                  min={200}
                  max={2000}
                  className="w-20 h-7 text-xs"
                />
              </div>
            </>
          )}
          
          {selectedElement && selectedElement !== 'canvas' && typeof selectedElement !== 'string' ? (
            <>
              {selectedElement.type === 'text' && (
                <>
                  {/* Text Content */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Content:</Label>
                    <Input
                      type="text"
                      value={selectedElement.content || ''}
                      onChange={(e) => handleTextUpdate('content', e.target.value)}
                      className="w-32 h-7 text-xs"
                    />
                  </div>

                  {/* Font Family */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Font:</Label>
                    <Select 
                      value={selectedElement.fontFamily || 'Arial, sans-serif'} 
                      onValueChange={handleFontFamilyChange}
                    >
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Size:</Label>
                    <div className="w-16">
                      <Slider
                        value={[selectedElement.fontSize || 16]}
                        max={72}
                        min={8}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6">{selectedElement.fontSize || 16}</span>
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Color:</Label>
                    <Input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => handleTextUpdate('color', e.target.value)}
                      className="w-12 h-7 p-1"
                    />
                  </div>

                  {/* Text Formatting */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStyleToggle('bold')}
                      className="h-7 w-7 p-0"
                      title="Bold"
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStyleToggle('italic')}
                      className="h-7 w-7 p-0"
                      title="Italic"
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStyleToggle('underline')}
                      className="h-7 w-7 p-0"
                      title="Underline"
                    >
                      <Underline className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAlignmentChange('left')}
                      className="h-7 w-7 p-0"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAlignmentChange('center')}
                      className="h-7 w-7 p-0"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAlignmentChange('right')}
                      className="h-7 w-7 p-0"
                      title="Align Right"
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}

              {selectedElement.type === 'image' && (
                <>
                  {/* Image URL Input */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Image URL:</Label>
                    <Input
                      type="url"
                      value={selectedElement.imageUrl || ''}
                      onChange={(e) => handleTextUpdate('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-48 h-7 text-xs"
                    />
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="flex items-center gap-2">
                    <AspectRatioSelector
                      element={selectedElement}
                      onUpdateElement={onUpdateElement}
                    />
                  </div>
                </>
              )}

              {selectedElement.type === 'youtube' && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">YouTube URL:</Label>
                  <Input
                    type="url"
                    value={selectedElement.youtubeUrl || ''}
                    onChange={(e) => handleTextUpdate('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-48 h-7 text-xs"
                  />
                </div>
              )}

              <Button variant="destructive" size="sm" onClick={handleDelete} className="h-7 px-2">
                <Trash2 className="w-3 h-3 mr-1" />
                <span className="text-xs">Delete</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
