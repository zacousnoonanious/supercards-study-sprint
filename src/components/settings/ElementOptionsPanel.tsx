
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, Settings, Link, Palette, Type, Volume2, Image, Play } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementOptionsPanelProps {
  element: CanvasElement;
  onUpdateElement: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  element,
  onUpdateElement,
  onDelete,
}) => {
  const getElementIcon = () => {
    switch (element.type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': 
      case 'tts': return <Volume2 className="w-4 h-4" />;
      case 'youtube': return <Play className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getElementTypeLabel = () => {
    switch (element.type) {
      case 'text': return 'Text Element';
      case 'image': return 'Image Element';
      case 'audio': return 'Audio Element';
      case 'tts': return 'Text-to-Speech';
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'fill-in-blank': return 'Fill in Blank';
      case 'youtube': return 'YouTube Video';
      case 'deck-embed': return 'Embedded Deck';
      case 'drawing': return 'Drawing Canvas';
      default: return 'Element';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getElementIcon()}
          {getElementTypeLabel()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position & Size */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Position & Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="element-x" className="text-xs">X Position</Label>
              <Input
                id="element-x"
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdateElement({ x: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="element-y" className="text-xs">Y Position</Label>
              <Input
                id="element-y"
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdateElement({ y: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="element-width" className="text-xs">Width</Label>
              <Input
                id="element-width"
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onUpdateElement({ width: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="element-height" className="text-xs">Height</Label>
              <Input
                id="element-height"
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onUpdateElement({ height: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="element-rotation" className="text-xs">Rotation (°)</Label>
              <Input
                id="element-rotation"
                type="number"
                value={element.rotation || 0}
                onChange={(e) => onUpdateElement({ rotation: parseInt(e.target.value) || 0 })}
                className="h-8"
                min="0"
                max="360"
              />
            </div>
            <div>
              <Label htmlFor="element-zindex" className="text-xs">Layer (Z-Index)</Label>
              <Input
                id="element-zindex"
                type="number"
                value={element.zIndex || 0}
                onChange={(e) => onUpdateElement({ zIndex: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Text Element Properties */}
        {element.type === 'text' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Properties
            </Label>
            <div>
              <Label htmlFor="element-content" className="text-xs">Content</Label>
              <Input
                id="element-content"
                value={element.content || ''}
                onChange={(e) => onUpdateElement({ content: e.target.value })}
                placeholder="Enter text content"
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="element-fontsize" className="text-xs">Font Size</Label>
                <Input
                  id="element-fontsize"
                  type="number"
                  value={element.fontSize || 16}
                  onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) || 16 })}
                  className="h-8"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <Label htmlFor="element-color" className="text-xs">Color</Label>
                <Input
                  id="element-color"
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => onUpdateElement({ color: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="element-textalign" className="text-xs">Text Alignment</Label>
              <Select
                value={element.textAlign || 'left'}
                onValueChange={(value) => onUpdateElement({ textAlign: value as 'left' | 'center' | 'right' | 'justify' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement({ 
                  fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
                className="h-8 text-xs"
              >
                <strong>B</strong>
              </Button>
              <Button
                variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement({ 
                  fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className="h-8 text-xs"
              >
                <em>I</em>
              </Button>
              <Button
                variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement({ 
                  textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className="h-8 text-xs"
              >
                <u>U</u>
              </Button>
            </div>
          </div>
        )}

        {/* Image Element Properties */}
        {element.type === 'image' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Properties
            </Label>
            <div>
              <Label htmlFor="element-imageurl" className="text-xs">Image URL</Label>
              <Input
                id="element-imageurl"
                value={element.imageUrl || ''}
                onChange={(e) => onUpdateElement({ imageUrl: e.target.value })}
                placeholder="Enter image URL"
                className="h-8"
              />
            </div>
          </div>
        )}

        {/* Audio Element Properties */}
        {(element.type === 'audio' || element.type === 'tts') && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio Properties
            </Label>
            {element.type === 'audio' && (
              <div>
                <Label htmlFor="element-audiourl" className="text-xs">Audio URL</Label>
                <Input
                  id="element-audiourl"
                  value={element.audioUrl || ''}
                  onChange={(e) => onUpdateElement({ audioUrl: e.target.value })}
                  placeholder="Enter audio URL"
                  className="h-8"
                />
              </div>
            )}
            {element.type === 'tts' && (
              <>
                <div>
                  <Label htmlFor="element-ttstext" className="text-xs">Text to Speak</Label>
                  <Input
                    id="element-ttstext"
                    value={element.text || element.content || ''}
                    onChange={(e) => onUpdateElement({ text: e.target.value, content: e.target.value })}
                    placeholder="Enter text for speech"
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="element-rate" className="text-xs">Speech Rate</Label>
                    <Input
                      id="element-rate"
                      type="number"
                      value={element.rate || 1}
                      onChange={(e) => onUpdateElement({ rate: parseFloat(e.target.value) || 1 })}
                      className="h-8"
                      min="0.5"
                      max="2"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="element-pitch" className="text-xs">Pitch</Label>
                    <Input
                      id="element-pitch"
                      type="number"
                      value={element.pitch || 1}
                      onChange={(e) => onUpdateElement({ pitch: parseFloat(e.target.value) || 1 })}
                      className="h-8"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Multiple Choice Properties */}
        {element.type === 'multiple-choice' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Multiple Choice Options</Label>
            <div>
              <Label htmlFor="element-question" className="text-xs">Question</Label>
              <Input
                id="element-question"
                value={element.content || ''}
                onChange={(e) => onUpdateElement({ content: e.target.value })}
                placeholder="Enter question"
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Answer Options</Label>
              {(element.multipleChoiceOptions || ['Option 1', 'Option 2']).map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.multipleChoiceOptions || [])];
                      newOptions[index] = e.target.value;
                      onUpdateElement({ multipleChoiceOptions: newOptions });
                    }}
                    className="h-8 flex-1"
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant={element.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateElement({ correctAnswer: index })}
                    className="h-8 w-8 p-0"
                    title="Mark as correct"
                  >
                    ✓
                  </Button>
                  {(element.multipleChoiceOptions?.length || 0) > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = (element.multipleChoiceOptions || []).filter((_, i) => i !== index);
                        const currentCorrectAnswer = typeof element.correctAnswer === 'number' ? element.correctAnswer : 0;
                        const newCorrectAnswer = currentCorrectAnswer === index ? 0 : 
                          currentCorrectAnswer > index ? currentCorrectAnswer - 1 : currentCorrectAnswer;
                        onUpdateElement({ 
                          multipleChoiceOptions: newOptions,
                          correctAnswer: newCorrectAnswer
                        });
                      }}
                      className="h-8 w-8 p-0"
                      title="Remove option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentOptions = element.multipleChoiceOptions || [];
                  const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
                  onUpdateElement({ multipleChoiceOptions: newOptions });
                }}
                className="h-8 w-full"
              >
                + Add Option
              </Button>
            </div>
          </div>
        )}

        {/* YouTube Properties */}
        {element.type === 'youtube' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Play className="w-4 h-4" />
              YouTube Properties
            </Label>
            <div>
              <Label htmlFor="element-youtube" className="text-xs">YouTube URL or Video ID</Label>
              <Input
                id="element-youtube"
                value={element.youtubeUrl || element.videoId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Extract video ID from URL if it's a full YouTube URL
                  const videoId = value.includes('youtube.com') || value.includes('youtu.be') 
                    ? value.split(/[?&]/)[0].split('/').pop()?.replace('watch?v=', '') || value
                    : value;
                  onUpdateElement({ youtubeUrl: value, videoId, youtubeVideoId: videoId });
                }}
                placeholder="Enter YouTube URL or video ID"
                className="h-8"
              />
            </div>
          </div>
        )}

        {/* Link Properties */}
        {element.linkData && (
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link Properties
            </Label>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm text-blue-700">
                {element.linkData.type === 'card-jump' 
                  ? 'Links to another card' 
                  : `Action: ${element.linkData.actionType}`}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onDelete}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Element
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
