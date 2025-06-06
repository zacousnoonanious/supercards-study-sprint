
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Plus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronDown, ChevronRight, Palette, Type, Move, RotateCw } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface ElementPopupToolbarProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  position: { x: number; y: number };
}

export const ElementPopupToolbar: React.FC<ElementPopupToolbarProps> = ({
  element,
  onUpdate,
  onDelete,
  position,
}) => {
  const { theme } = useTheme();
  const [localOptions, setLocalOptions] = useState(element.multipleChoiceOptions || ['Option 1', 'Option 2']);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['content']));

  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...localOptions];
    newOptions[index] = value;
    setLocalOptions(newOptions);
    onUpdate({ multipleChoiceOptions: newOptions });
  };

  const addOption = () => {
    const newOptions = [...localOptions, `Option ${localOptions.length + 1}`];
    setLocalOptions(newOptions);
    onUpdate({ multipleChoiceOptions: newOptions });
  };

  const removeOption = (index: number) => {
    if (localOptions.length > 2) {
      const newOptions = localOptions.filter((_, i) => i !== index);
      setLocalOptions(newOptions);
      onUpdate({ multipleChoiceOptions: newOptions });
      
      if (element.correctAnswer === index) {
        onUpdate({ correctAnswer: 0 });
      } else if (element.correctAnswer && element.correctAnswer > index) {
        onUpdate({ correctAnswer: element.correctAnswer - 1 });
      }
    }
  };

  const renderContentSettings = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Text Content</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter text..."
                className="h-16 text-xs"
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Image URL</Label>
              <Input
                value={element.imageUrl || ''}
                onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                placeholder="Enter image URL"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Alt Text</Label>
              <Input
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter alt text"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onUpdate({ imageUrl: url });
                  }
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        );
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Question</Label>
              <Input
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter your question"
                className="h-8"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium">Options</Label>
              <div className="space-y-2">
                {localOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={element.correctAnswer === index}
                        onChange={() => onUpdate({ correctAnswer: index })}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-500">{index + 1}.</span>
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="h-7 text-xs flex-1"
                    />
                    {localOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="h-7 w-7 p-0 text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          </div>
        );
      case 'true-false':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Statement</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter true/false statement"
                className="h-16 text-xs"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium">Correct Answer</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={element.correctAnswer === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate({ correctAnswer: 1 })}
                  className="text-xs"
                >
                  True
                </Button>
                <Button
                  variant={element.correctAnswer === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate({ correctAnswer: 0 })}
                  className="text-xs"
                >
                  False
                </Button>
              </div>
            </div>
          </div>
        );
      case 'youtube':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">YouTube URL</Label>
              <Input
                value={element.youtubeUrl || ''}
                onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-8 text-xs"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Autoplay</Label>
              <Switch
                checked={element.autoplay || false}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
              />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Audio URL</Label>
              <Input
                value={element.audioUrl || ''}
                onChange={(e) => onUpdate({ audioUrl: e.target.value })}
                placeholder="Enter audio URL"
                className="h-8 text-xs"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium">Upload Audio</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onUpdate({ audioUrl: url });
                  }
                }}
                className="h-8 text-xs"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Auto Play</Label>
              <Switch
                checked={element.autoplay || false}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
              />
            </div>
          </div>
        );
      case 'deck-embed':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs font-medium">Deck ID</Label>
              <Input
                value={element.deckId || ''}
                onChange={(e) => onUpdate({ deckId: e.target.value })}
                placeholder="Enter deck ID to embed"
                className="h-8 text-xs"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium">Display Title</Label>
              <Input
                value={element.deckTitle || ''}
                onChange={(e) => onUpdate({ deckTitle: e.target.value })}
                placeholder="Optional display title"
                className="h-8 text-xs"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTextStyling = () => {
    if (element.type !== 'text' && element.type !== 'multiple-choice' && element.type !== 'true-false') {
      return null;
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-medium">Font Size</Label>
            <Input
              type="number"
              value={element.fontSize || 16}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className="h-8 text-xs"
              min="8"
              max="72"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Color</Label>
            <Input
              type="color"
              value={element.color || '#000000'}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="h-8"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium">Text Formatting</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
              })}
              className="h-7 w-7 p-0"
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
              className="h-7 w-7 p-0"
            >
              <Italic className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
              })}
              className="h-7 w-7 p-0"
            >
              <Underline className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium">Text Alignment</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={element.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ textAlign: 'left' })}
              className="h-7 w-7 p-0"
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ textAlign: 'center' })}
              className="h-7 w-7 p-0"
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ textAlign: 'right' })}
              className="h-7 w-7 p-0"
            >
              <AlignRight className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'justify' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ textAlign: 'justify' })}
              className="h-7 w-7 p-0"
            >
              <AlignJustify className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPositionAndSize = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-medium">X Position</Label>
          <Input
            type="number"
            value={element.x}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Y Position</Label>
          <Input
            type="number"
            value={element.y}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs font-medium">Width</Label>
          <Input
            type="number"
            value={element.width}
            onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
            min="10"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Height</Label>
          <Input
            type="number"
            value={element.height}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
            min="10"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium">Rotation (degrees)</Label>
        <Input
          type="number"
          value={element.rotation || 0}
          onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) || 0 })}
          className="h-8 text-xs"
          min="0"
          max="360"
        />
      </div>

      <div>
        <Label className="text-xs font-medium">Layer Order</Label>
        <Input
          type="number"
          value={element.zIndex || 0}
          onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) || 0 })}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );

  return (
    <Card
      className={`w-72 shadow-lg border ${
        isDarkTheme 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-200'
      }`}
      style={{
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium capitalize">
            {element.type.replace('-', ' ')} Settings
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {/* Content Settings */}
          <Collapsible open={openSections.has('content')} onOpenChange={() => toggleSection('content')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-8">
                <div className="flex items-center gap-2">
                  <Type className="w-3 h-3" />
                  <span className="text-xs font-medium">Content</span>
                </div>
                {openSections.has('content') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 px-2">
              {renderContentSettings()}
            </CollapsibleContent>
          </Collapsible>

          {/* Text Styling */}
          {(element.type === 'text' || element.type === 'multiple-choice' || element.type === 'true-false') && (
            <Collapsible open={openSections.has('styling')} onOpenChange={() => toggleSection('styling')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-8">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    <span className="text-xs font-medium">Text Styling</span>
                  </div>
                  {openSections.has('styling') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 px-2">
                {renderTextStyling()}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Position & Size */}
          <Collapsible open={openSections.has('position')} onOpenChange={() => toggleSection('position')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-8">
                <div className="flex items-center gap-2">
                  <Move className="w-3 h-3" />
                  <span className="text-xs font-medium">Position & Size</span>
                </div>
                {openSections.has('position') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 px-2">
              {renderPositionAndSize()}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
