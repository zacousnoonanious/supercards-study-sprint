import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Upload, Play, Square } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';
import { FillInBlankEditor } from './FillInBlankEditor';

interface ElementOptionsPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
}

export const ElementOptionsPanel: React.FC<ElementOptionsPanelProps> = ({
  element,
  onUpdate,
  onDelete,
}) => {
  const { t } = useI18n();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  if (!element) {
    return (
      <Card className="w-80 h-full">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('editor.selectElement') || 'Select an element to edit its properties'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      onUpdate({ imageUrl });
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audioUrl = URL.createObjectURL(file);
      onUpdate({ audioUrl });
    }
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          {t('editor.elementProperties') || 'Element Properties'}
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 overflow-auto">
        {/* Common Properties */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('editor.position') || 'Position'}</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={element.x}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={element.y}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('editor.size') || 'Size'}</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{t('editor.width') || 'Width'}</Label>
              <Input
                type="number"
                value={element.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">{t('editor.height') || 'Height'}</Label>
              <Input
                type="number"
                value={element.height}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Text Element Properties */}
        {element.type === 'text' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.content') || 'Content'}</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={t('placeholders.enterText') || 'Enter text...'}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.fontSize') || 'Font Size'}</Label>
              <Input
                type="number"
                value={element.fontSize || 16}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                min="8"
                max="72"
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.fontFamily') || 'Font Family'}</Label>
              <Select
                value={element.fontFamily || 'Arial'}
                onValueChange={(value) => onUpdate({ fontFamily: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.textColor') || 'Text Color'}</Label>
              <Input
                type="color"
                value={element.color || '#000000'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="h-8 w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.backgroundColor') || 'Background Color'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={(element.backgroundColor && element.backgroundColor !== 'transparent') ? element.backgroundColor : '#ffffff'}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="h-8 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => onUpdate({ backgroundColor: 'transparent' })}
                >
                  {t('common.clear') || 'Clear'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.textAlign') || 'Text Alignment'}</Label>
              <Select
                value={element.textAlign || 'left'}
                onValueChange={(value) => onUpdate({ textAlign: value as 'left' | 'center' | 'right' | 'justify' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">{t('editor.alignLeft') || 'Left'}</SelectItem>
                  <SelectItem value="center">{t('editor.alignCenter') || 'Center'}</SelectItem>
                  <SelectItem value="right">{t('editor.alignRight') || 'Right'}</SelectItem>
                  <SelectItem value="justify">{t('editor.alignJustify') || 'Justify'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Image Element Properties */}
        {element.type === 'image' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.image') || 'Image'}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="h-8"
              />
              {element.imageUrl && (
                <div className="mt-2">
                  <img
                    src={element.imageUrl}
                    alt="Preview"
                    className="max-w-full h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.altText') || 'Alt Text'}</Label>
              <Input
                value={element.altText || ''}
                onChange={(e) => onUpdate({ altText: e.target.value })}
                placeholder={t('placeholders.altText') || 'Describe the image...'}
                className="h-8"
              />
            </div>
          </>
        )}

        {/* Audio Element Properties */}
        {element.type === 'audio' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.audio') || 'Audio'}</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="h-8"
              />
              {element.audioUrl && (
                <div className="mt-2">
                  <audio controls className="w-full">
                    <source src={element.audioUrl} />
                  </audio>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={element.autoplay || false}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
              />
              <Label className="text-sm">{t('editor.autoplay') || 'Autoplay'}</Label>
            </div>
          </>
        )}

        {/* TTS Element Properties */}
        {element.type === 'tts' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.textToSpeak') || 'Text to Speak'}</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={t('placeholders.enterTextToSpeak') || 'Enter text to speak...'}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.voice') || 'Voice'}</Label>
              <Select
                value={element.voice || 'default'}
                onValueChange={(value) => onUpdate({ voice: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.speed') || 'Speed'}</Label>
              <Input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={element.speed || 1}
                onChange={(e) => onUpdate({ speed: Number(e.target.value) })}
                className="h-8"
              />
              <div className="text-xs text-muted-foreground text-center">
                {element.speed || 1}x
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={element.autoplay || false}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
              />
              <Label className="text-sm">{t('editor.autoplay') || 'Autoplay'}</Label>
            </div>
          </>
        )}

        {/* Multiple Choice Element Properties */}
        {element.type === 'multiple-choice' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.question') || 'Question'}</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={t('placeholders.enterQuestion') || 'Enter your question...'}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.options') || 'Options'}</Label>
              {(element.multipleChoiceOptions || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.multipleChoiceOptions || [])];
                      newOptions[index] = e.target.value;
                      onUpdate({ multipleChoiceOptions: newOptions });
                    }}
                    className="h-8 flex-1"
                  />
                  <Button
                    variant={element.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdate({ correctAnswer: index })}
                    className="h-8 px-2"
                  >
                    {element.correctAnswer === index ? '✓' : '○'}
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(element.multipleChoiceOptions || []), `Option ${(element.multipleChoiceOptions || []).length + 1}`];
                  onUpdate({ multipleChoiceOptions: newOptions });
                }}
                className="h-8 w-full"
              >
                {t('editor.addOption') || 'Add Option'}
              </Button>
            </div>
          </>
        )}

        {/* True/False Element Properties */}
        {element.type === 'true-false' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.question') || 'Question'}</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder={t('placeholders.enterTrueFalseQuestion') || 'Enter your true/false question...'}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.correctAnswer') || 'Correct Answer'}</Label>
              <div className="flex gap-2">
                <Button
                  variant={element.correctAnswer === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate({ correctAnswer: 1 })}
                  className="flex-1"
                >
                  {t('common.true') || 'True'}
                </Button>
                <Button
                  variant={element.correctAnswer === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate({ correctAnswer: 0 })}
                  className="flex-1"
                >
                  {t('common.false') || 'False'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Fill in Blank Element Properties */}
        {element.type === 'fill-in-blank' && (
          <>
            <div className="space-y-3">
              <FillInBlankEditor
                element={element}
                onUpdate={onUpdate}
              />
              
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={element.ignoreCase !== false}
                    onCheckedChange={(checked) => onUpdate({ ignoreCase: checked })}
                  />
                  <Label className="text-sm">{t('editor.ignoreCase') || 'Ignore Case'}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={element.showLetterCount === true}
                    onCheckedChange={(checked) => onUpdate({ showLetterCount: checked })}
                  />
                  <Label className="text-sm">{t('editor.showLetterCount') || 'Show Letter Count'}</Label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* YouTube Element Properties */}
        {element.type === 'youtube' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.youtubeUrl') || 'YouTube URL'}</Label>
              <Input
                value={element.youtubeUrl || ''}
                onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-8"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={element.autoplay || false}
                onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
              />
              <Label className="text-sm">{t('editor.autoplay') || 'Autoplay'}</Label>
            </div>
          </>
        )}

        {/* Deck Embed Element Properties */}
        {element.type === 'deck-embed' && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.deckId') || 'Deck ID'}</Label>
              <Input
                value={element.deckId || ''}
                onChange={(e) => onUpdate({ deckId: e.target.value })}
                placeholder={t('placeholders.enterDeckId') || 'Enter deck ID...'}
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('editor.deckTitle') || 'Deck Title'}</Label>
              <Input
                value={element.deckTitle || ''}
                onChange={(e) => onUpdate({ deckTitle: e.target.value })}
                placeholder={t('placeholders.enterDeckTitle') || 'Enter deck title...'}
                className="h-8"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
