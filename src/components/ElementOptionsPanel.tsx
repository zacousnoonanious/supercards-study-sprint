import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Type, Link, Upload, Trash2, Maximize2 } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface ElementOptionsPanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  onCanvasSizeChange?: (width: number, height: number) => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth = 900,
  canvasHeight = 600,
  onCanvasSizeChange,
}) => {
  const { theme } = useTheme();

  if (!selectedElement) {
    return (
      <div className={`w-full h-16 border-b flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'
      }`}>
        <p className="text-sm text-muted-foreground">Select an element to see options</p>
      </div>
    );
  }

  const handleStyleToggle = (style: 'bold' | 'italic' | 'underline') => {
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
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    onUpdateElement(selectedElement.id, { textAlign: alignment });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdateElement(selectedElement.id, { imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdateElement(selectedElement.id, { audioUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleChoiceOptionChange = (index: number, value: string) => {
    const newOptions = [...(selectedElement.multipleChoiceOptions || [])];
    newOptions[index] = value;
    onUpdateElement(selectedElement.id, { multipleChoiceOptions: newOptions });
  };

  const handleAddOption = () => {
    const currentOptions = selectedElement.multipleChoiceOptions || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    onUpdateElement(selectedElement.id, { multipleChoiceOptions: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = (selectedElement.multipleChoiceOptions || []).filter((_, i) => i !== index);
    const newCorrectAnswer = selectedElement.correctAnswer === index ? 0 : 
      (selectedElement.correctAnswer || 0) > index ? (selectedElement.correctAnswer || 0) - 1 : selectedElement.correctAnswer;
    
    onUpdateElement(selectedElement.id, { 
      multipleChoiceOptions: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  return (
    <div className={`w-full h-16 border-b px-4 flex items-center gap-4 overflow-x-auto ${
      theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'
    }`}>
      {/* Canvas Size Controls - Always visible */}
      <div className="flex items-center gap-2 min-w-fit">
        <Maximize2 className="w-3 h-3" />
        <Label className="text-xs">Canvas:</Label>
        <Input
          type="number"
          value={canvasWidth}
          onChange={(e) => onCanvasSizeChange?.(parseInt(e.target.value), canvasHeight)}
          className="w-16 h-8 text-xs"
          min="400"
          max="1200"
        />
        <span className="text-xs">×</span>
        <Input
          type="number"
          value={canvasHeight}
          onChange={(e) => onCanvasSizeChange?.(canvasWidth, parseInt(e.target.value))}
          className="w-16 h-8 text-xs"
          min="300"
          max="1000"
        />
        <Separator orientation="vertical" className="h-6" />
      </div>

      {!selectedElement ? (
        <p className="text-sm text-muted-foreground">Select an element to see options</p>
      ) : (
        <>
          {/* Element type indicator */}
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {selectedElement.type.replace('-', ' ')}
            </span>
            <Separator orientation="vertical" className="h-6" />
          </div>

          {/* Text element options */}
          {selectedElement.type === 'text' && (
            <>
              {/* Text formatting */}
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleToggle('bold')}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleToggle('italic')}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleToggle('underline')}
                  className="h-8 w-8 p-0"
                >
                  <Underline className="w-3 h-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Font size */}
              <div className="flex items-center gap-2">
                <Type className="w-3 h-3" />
                <Select 
                  value={(selectedElement.fontSize || 16).toString()} 
                  onValueChange={(value) => onUpdateElement(selectedElement.id, { fontSize: parseInt(value) })}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="28">28</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-2">
                <Palette className="w-3 h-3" />
                <Input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                  className="w-12 h-8 p-1 rounded"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Text alignment */}
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAlignmentChange('left')}
                  className="h-8 w-8 p-0"
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAlignmentChange('center')}
                  className="h-8 w-8 p-0"
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAlignmentChange('right')}
                  className="h-8 w-8 p-0"
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'justify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAlignmentChange('justify')}
                  className="h-8 w-8 p-0"
                >
                  <AlignJustify className="w-3 h-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Hyperlink */}
              <div className="flex items-center gap-2">
                <Link className="w-3 h-3" />
                <Input
                  placeholder="URL"
                  value={selectedElement.hyperlink || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { hyperlink: e.target.value })}
                  className="w-32 h-8"
                />
              </div>
            </>
          )}

          {/* Image element options */}
          {selectedElement.type === 'image' && (
            <>
              <div className="flex items-center gap-2">
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs w-32"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Link className="w-3 h-3" />
                <Input
                  placeholder="URL"
                  value={selectedElement.hyperlink || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { hyperlink: e.target.value })}
                  className="w-32 h-8"
                />
              </div>
            </>
          )}

          {/* Audio element options */}
          {selectedElement.type === 'audio' && (
            <>
              <div className="flex items-center gap-2">
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="text-xs w-32"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Link className="w-3 h-3" />
                <Input
                  placeholder="URL"
                  value={selectedElement.hyperlink || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { hyperlink: e.target.value })}
                  className="w-32 h-8"
                />
              </div>
            </>
          )}

          {/* Multiple choice options */}
          {selectedElement.type === 'multiple-choice' && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Question:</Label>
                <Input
                  value={selectedElement.content || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                  className="w-40 h-8"
                  placeholder="Enter question"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Label className="text-xs">Options:</Label>
                <div className="flex gap-1 max-w-64 overflow-x-auto">
                  {(selectedElement.multipleChoiceOptions || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-1 min-w-fit">
                      <Input
                        value={option}
                        onChange={(e) => handleMultipleChoiceOptionChange(index, e.target.value)}
                        className="w-20 h-8 text-xs"
                      />
                      <Button
                        variant={selectedElement.correctAnswer === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onUpdateElement(selectedElement.id, { correctAnswer: index })}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        ✓
                      </Button>
                      {(selectedElement.multipleChoiceOptions?.length || 0) > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-8 px-2 text-xs"
                  >
                    +
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* True/False options */}
          {selectedElement.type === 'true-false' && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Statement:</Label>
                <Input
                  value={selectedElement.content || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                  className="w-40 h-8"
                  placeholder="Enter statement"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Label className="text-xs">Correct Answer:</Label>
                <Button
                  variant={selectedElement.correctAnswer === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateElement(selectedElement.id, { correctAnswer: 0 })}
                  className="h-8 px-3 text-xs"
                >
                  True
                </Button>
                <Button
                  variant={selectedElement.correctAnswer === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateElement(selectedElement.id, { correctAnswer: 1 })}
                  className="h-8 px-3 text-xs"
                >
                  False
                </Button>
              </div>
            </>
          )}

          {/* YouTube options */}
          {selectedElement.type === 'youtube' && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Video URL:</Label>
                <Input
                  value={selectedElement.content || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                  className="w-48 h-8"
                  placeholder="Enter YouTube URL"
                />
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Link className="w-3 h-3" />
                <Input
                  placeholder="Link URL"
                  value={selectedElement.hyperlink || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { hyperlink: e.target.value })}
                  className="w-32 h-8"
                />
              </div>
            </>
          )}

          {/* Drawing options */}
          {selectedElement.type === 'drawing' && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Stroke:</Label>
                <Input
                  type="color"
                  value={selectedElement.strokeColor || '#000000'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                  className="w-12 h-8 p-1 rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs">Width:</Label>
                <Input
                  type="number"
                  value={selectedElement.strokeWidth || 2}
                  onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) })}
                  className="w-16 h-8"
                  min="1"
                  max="20"
                />
              </div>
            </>
          )}

          {/* Delete button - always visible for selected element */}
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
