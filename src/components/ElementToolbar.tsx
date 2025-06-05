import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Type, 
  Image, 
  Volume2, 
  Pencil, 
  CheckSquare, 
  ToggleLeft,
  Youtube,
  Layers,
  Plus,
  Copy,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText
} from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementToolbarProps {
  onAddElement: (type: string) => void;
  selectedElement: CanvasElement | null;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onCreateNewCard,
  onCreateNewCardWithLayout,
}) => {
  const elementTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'audio', icon: Volume2, label: 'Audio' },
    { type: 'drawing', icon: Pencil, label: 'Drawing' },
    { type: 'multiple-choice', icon: CheckSquare, label: 'Multiple Choice' },
    { type: 'true-false', icon: ToggleLeft, label: 'True/False' },
    { type: 'fill-in-blank', icon: FileText, label: 'Fill in Blank' },
    { type: 'youtube', icon: Youtube, label: 'YouTube' },
    { type: 'deck-embed', icon: Layers, label: 'Embed Deck' },
  ];

  const renderTextSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Text</Label>
        <Input
          value={selectedElement?.text || ''}
          onChange={(e) => onUpdateElement({ text: e.target.value })}
          placeholder="Enter your text here..."
          className="h-20"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Bold</Label>
        <Switch
          checked={selectedElement?.bold || false}
          onCheckedChange={(checked) => onUpdateElement({ bold: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Italic</Label>
        <Switch
          checked={selectedElement?.italic || false}
          onCheckedChange={(checked) => onUpdateElement({ italic: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Underline</Label>
        <Switch
          checked={selectedElement?.underline || false}
          onCheckedChange={(checked) => onUpdateElement({ underline: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Align</Label>
        <Select
          value={selectedElement?.align || 'left'}
          onValueChange={(value) => onUpdateElement({ align: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Align" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderImageSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Image</Label>
        <Input
          value={selectedElement?.imageUrl || ''}
          onChange={(e) => onUpdateElement({ imageUrl: e.target.value })}
          placeholder="Enter image URL here..."
          className="h-20"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Align</Label>
        <Select
          value={selectedElement?.align || 'left'}
          onValueChange={(value) => onUpdateElement({ align: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Align" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMultipleChoiceSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Question</Label>
        <Textarea
          value={selectedElement?.question || ''}
          onChange={(e) => onUpdateElement({ question: e.target.value })}
          placeholder="Enter your question here..."
          className="h-20"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium">Options</Label>
        <div className="space-y-2">
          {selectedElement?.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...selectedElement?.options || []];
                  newOptions[index] = e.target.value;
                  onUpdateElement({ options: newOptions });
                }}
                placeholder="Option"
                className="w-full"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newOptions = [...selectedElement?.options || []];
                  newOptions.splice(index, 1);
                  onUpdateElement({ options: newOptions });
                }}
                className="ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newOptions = [...(selectedElement?.options || [])];
              newOptions.push('');
              onUpdateElement({ options: newOptions });
            }}
            className="w-full justify-start text-sm"
          >
            Add Option
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Correct Answer</Label>
        <Select
          value={selectedElement?.correctAnswer || ''}
          onValueChange={(value) => onUpdateElement({ correctAnswer: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Correct Answer" />
          </SelectTrigger>
          <SelectContent>
            {selectedElement?.options.map((option, index) => (
              <SelectItem key={index} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTrueFalseSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Question</Label>
        <Textarea
          value={selectedElement?.question || ''}
          onChange={(e) => onUpdateElement({ question: e.target.value })}
          placeholder="Enter your question here..."
          className="h-20"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium">Options</Label>
        <div className="space-y-2">
          <div className="flex items-center">
            <Input
              value={selectedElement?.trueOption || ''}
              onChange={(e) => onUpdateElement({ trueOption: e.target.value })}
              placeholder="True"
              className="w-full"
            />
            <Input
              value={selectedElement?.falseOption || ''}
              onChange={(e) => onUpdateElement({ falseOption: e.target.value })}
              placeholder="False"
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Correct Answer</Label>
        <Select
          value={selectedElement?.correctAnswer || ''}
          onValueChange={(value) => onUpdateElement({ correctAnswer: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Correct Answer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFillInBlankSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Sentence Text</Label>
        <Textarea
          value={selectedElement?.fillInBlankText || ''}
          onChange={(e) => onUpdateElement({ fillInBlankText: e.target.value })}
          placeholder="Enter your sentence here..."
          className="h-20"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Show Letter Count</Label>
        <Switch
          checked={selectedElement?.showLetterCount || false}
          onCheckedChange={(checked) => onUpdateElement({ showLetterCount: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ignore Case</Label>
        <Switch
          checked={selectedElement?.ignoreCase || false}
          onCheckedChange={(checked) => onUpdateElement({ ignoreCase: checked })}
        />
      </div>
      
      {selectedElement?.fillInBlankBlanks && selectedElement.fillInBlankBlanks.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedElement.fillInBlankBlanks.length} blank(s) created
        </div>
      )}
    </div>
  );

  const renderYouTubeSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">YouTube URL</Label>
        <Input
          value={selectedElement?.youtubeUrl || ''}
          onChange={(e) => onUpdateElement({ youtubeUrl: e.target.value })}
          placeholder="Enter YouTube URL here..."
          className="h-20"
        />
      </div>
    </div>
  );

  const renderDeckEmbedSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Deck Embed URL</Label>
        <Input
          value={selectedElement?.deckEmbedUrl || ''}
          onChange={(e) => onUpdateElement({ deckEmbedUrl: e.target.value })}
          placeholder="Enter Deck Embed URL here..."
          className="h-20"
        />
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">Audio URL</Label>
        <Input
          value={selectedElement?.audioUrl || ''}
          onChange={(e) => onUpdateElement({ audioUrl: e.target.value })}
          placeholder="Enter Audio URL here..."
          className="h-20"
        />
      </div>
    </div>
  );

  const renderElementSettings = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case 'text':
        return renderTextSettings();
      case 'image':
        return renderImageSettings();
      case 'multiple-choice':
        return renderMultipleChoiceSettings();
      case 'true-false':
        return renderTrueFalseSettings();
      case 'fill-in-blank':
        return renderFillInBlankSettings();
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
    <div className="space-y-4">
      {/* Add Elements Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {elementTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => onAddElement(type)}
                className="justify-start text-sm h-9"
              >
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Card Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={onCreateNewCard}
            className="w-full justify-start text-sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Blank Card
          </Button>
          <Button
            onClick={onCreateNewCardWithLayout}
            className="w-full justify-start text-sm"
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Layout
          </Button>
        </CardContent>
      </Card>

      {/* Element Settings */}
      {selectedElement && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {selectedElement.type.replace('-', ' ')} Settings
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteElement}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderElementSettings()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
