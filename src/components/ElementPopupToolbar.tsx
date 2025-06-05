import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
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

  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

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

  const renderTextSettings = () => (
    <div className="space-y-3">
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

  const renderImageSettings = () => (
    <div className="space-y-3">
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
    </div>
  );

  const renderMultipleChoiceSettings = () => (
    <div className="space-y-3">
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

  const renderTrueFalseSettings = () => (
    <div className="space-y-3">
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

  const renderYouTubeSettings = () => (
    <div className="space-y-3">
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

  const renderDeckEmbedSettings = () => (
    <div className="space-y-3">
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

  const renderAudioSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium">Audio URL</Label>
        <Input
          value={element.audioUrl || ''}
          onChange={(e) => onUpdate({ audioUrl: e.target.value })}
          placeholder="Enter audio URL or upload file"
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

  const renderSettings = () => {
    switch (element.type) {
      case 'text':
        return renderTextSettings();
      case 'image':
        return renderImageSettings();
      case 'multiple-choice':
        return renderMultipleChoiceSettings();
      case 'true-false':
        return renderTrueFalseSettings();
      case 'youtube':
        return renderYouTubeSettings();
      case 'deck-embed':
        return renderDeckEmbedSettings();
      case 'audio':
        return renderAudioSettings();
      default:
        return null;
    }
  };

  return (
    <Card
      className={`absolute z-50 w-64 shadow-lg border ${
        isDarkTheme 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-200'
      }`}
      style={{
        left: position.x,
        top: position.y,
        maxWidth: '250px',
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
        
        {renderSettings()}
      </CardContent>
    </Card>
  );
};
