
import React, { useState, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Minus, 
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [googleTTSKey, setGoogleTTSKey] = useState(localStorage.getItem('google_tts_api_key') || '');

  // Load available voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleGoogleTTSKeyChange = (key: string) => {
    setGoogleTTSKey(key);
    if (key.trim()) {
      localStorage.setItem('google_tts_api_key', key.trim());
    } else {
      localStorage.removeItem('google_tts_api_key');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onUpdate({ imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!element) {
    return (
      <div className="w-80 p-4 border-l bg-background overflow-y-auto">
        <div className="text-center text-muted-foreground py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50" />
          </div>
          <p className="font-medium">{t('editor.noElementSelected')}</p>
          <p className="text-sm mt-1">{t('editor.clickElementToEdit')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 p-4 border-l bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium capitalize">{t(`editor.${element.type}Settings`)}</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">{t('editor.content')}</TabsTrigger>
          <TabsTrigger value="style">{t('editor.style')}</TabsTrigger>
          <TabsTrigger value="layout">{t('editor.layout')}</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Content-specific controls */}
          {element.type === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.content')}</Label>
                <Textarea
                  value={element.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder={t('placeholders.enterTextContent')}
                  rows={4}
                />
              </div>

              {/* TTS Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Text-to-Speech</Label>
                  <Switch
                    checked={element.hasTTS || false}
                    onCheckedChange={(checked) => onUpdate({
                      hasTTS: checked,
                      ttsEnabled: checked,
                      ttsAutoplay: false,
                      ttsRate: 1,
                      ttsPitch: 1
                    })}
                  />
                </div>

                {element.hasTTS && (
                  <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Auto-play</Label>
                      <Switch
                        checked={element.ttsAutoplay || false}
                        onCheckedChange={(checked) => onUpdate({ ttsAutoplay: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Voice</Label>
                      <Select
                        value={element.ttsVoice || ''}
                        onValueChange={(value) => onUpdate({ ttsVoice: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Default voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Default voice</SelectItem>
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Speed: {element.ttsRate || 1}x</Label>
                      <Slider
                        value={[element.ttsRate || 1]}
                        onValueChange={([value]) => onUpdate({ ttsRate: value })}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Pitch: {element.ttsPitch || 1}</Label>
                      <Slider
                        value={[element.ttsPitch || 1]}
                        onValueChange={([value]) => onUpdate({ ttsPitch: value })}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Google Neural TTS API Key</Label>
                      <Input
                        type="password"
                        value={googleTTSKey}
                        onChange={(e) => handleGoogleTTSKeyChange(e.target.value)}
                        placeholder="Optional: For high-quality voices"
                        className="h-8 text-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add your Google Cloud TTS API key for premium neural voices
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {element.type === 'image' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.imageUrl')}</Label>
                <Input
                  type="url"
                  value={element.imageUrl || ''}
                  onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-8"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('editor.uploadImage')}</Label>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {element.type === 'audio' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.audioUrl')}</Label>
                <Input
                  type="url"
                  value={element.audioUrl || ''}
                  onChange={(e) => onUpdate({ audioUrl: e.target.value })}
                  placeholder={t('placeholders.enterAudioUrl')}
                  className="h-8"
                />
              </div>
            </div>
          )}

          {element.type === 'youtube' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.youTubeUrl')}</Label>
                <Input
                  type="url"
                  value={element.youtubeUrl || ''}
                  onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
                  placeholder={t('placeholders.enterYouTubeUrl')}
                  className="h-8"
                />
              </div>
            </div>
          )}

          {element.type === 'multiple-choice' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.question')}</Label>
                <Textarea
                  value={element.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder={t('placeholders.enterQuestion')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('editor.options')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const currentOptions = element.multipleChoiceOptions || [];
                      const newOptions = [...currentOptions, t('placeholders.enterContent')];
                      
                      const newHeight = Math.max(element.height, 120 + (newOptions.length * 40));
                      
                      onUpdate({ 
                        multipleChoiceOptions: newOptions,
                        height: newHeight
                      });
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(element.multipleChoiceOptions || []).map((option, index) => (
                    <div key={index} className="flex gap-1 items-center">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(element.multipleChoiceOptions || [])];
                          newOptions[index] = e.target.value;
                          onUpdate({ multipleChoiceOptions: newOptions });
                        }}
                        className="h-6 text-xs flex-1"
                        placeholder={t('placeholders.enterContent')}
                      />
                      <Button
                        variant={element.correctAnswer === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onUpdate({ correctAnswer: index })}
                        className="h-6 w-6 p-0 text-xs"
                        title={t('placeholders.correctAnswer')}
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
                            
                            const newHeight = Math.max(120, 120 + (newOptions.length * 40));
                            
                            onUpdate({ 
                              multipleChoiceOptions: newOptions,
                              correctAnswer: newCorrectAnswer,
                              height: newHeight
                            });
                          }}
                          className="h-6 w-6 p-0 text-red-500"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {element.type === 'fill-in-blank' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.sentence')}</Label>
                <Textarea
                  value={element.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder={t('placeholders.enterSentence')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('editor.blanks')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const content = element.content || '';
                      const blanks = element.blanks || [];
                      const newBlank = {
                        id: `blank_${Date.now()}`,
                        word: 'answer',
                        startIndex: content.length,
                        endIndex: content.length + 6,
                      };
                      onUpdate({
                        content: content + ' [answer]',
                        blanks: [...blanks, newBlank],
                      });
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(element.blanks || []).map((blank, index) => (
                    <div key={blank.id} className="flex items-center space-x-1">
                      <Input
                        value={blank.word}
                        onChange={(e) => {
                          const newBlanks = [...(element.blanks || [])];
                          newBlanks[index] = {
                            ...blank,
                            word: e.target.value,
                          };
                          onUpdate({ blanks: newBlanks });
                        }}
                        className="h-7 text-xs flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          const newBlanks = (element.blanks || []).filter(
                            (b) => b.id !== blank.id
                          );
                          onUpdate({ blanks: newBlanks });
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          {/* Style controls for text elements */}
          {element.type === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.fontSize')}</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[element.fontSize || 16]}
                    min={8}
                    max={72}
                    step={1}
                    onValueChange={(value) => onUpdate({ fontSize: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm w-8 text-right">{element.fontSize || 16}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('editor.textColor')}</Label>
                <ColorPicker
                  color={element.color || '#000000'}
                  onChange={(color) => onUpdate({ color })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('editor.backgroundColor')}</Label>
                <ColorPicker
                  color={element.backgroundColor || '#ffffff'}
                  onChange={(color) => onUpdate({ backgroundColor: color })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('editor.fontFamily')}</Label>
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
                <Label>{t('editor.textAlign')}</Label>
                <div className="flex space-x-1">
                  <Button
                    variant={element.textAlign === 'left' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => onUpdate({ textAlign: 'left' })}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.textAlign === 'center' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => onUpdate({ textAlign: 'center' })}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.textAlign === 'right' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => onUpdate({ textAlign: 'right' })}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.textAlign === 'justify' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => onUpdate({ textAlign: 'justify' })}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('editor.textStyle')}</Label>
                <div className="flex space-x-1">
                  <Button
                    variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 font-bold"
                    onClick={() =>
                      onUpdate({
                        fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 italic"
                    onClick={() =>
                      onUpdate({
                        fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8 underline"
                    onClick={() =>
                      onUpdate({
                        textDecoration:
                          element.textDecoration === 'underline' ? 'none' : 'underline',
                      })
                    }
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image-specific style controls */}
          {element.type === 'image' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.opacity')}</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[element.opacity || 1]}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => onUpdate({ opacity: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">
                    {Math.round((element.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('editor.border')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('editor.width')}</Label>
                    <Input
                      type="number"
                      value={element.borderWidth || 0}
                      onChange={(e) =>
                        onUpdate({ borderWidth: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('editor.color')}</Label>
                    <ColorPicker
                      color={element.borderColor || '#000000'}
                      onChange={(color) => onUpdate({ borderColor: color })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('editor.borderRadius')}</Label>
                  <Switch
                    checked={element.borderRadius || false}
                    onCheckedChange={(checked) => onUpdate({ borderRadius: checked })}
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          {/* Common layout controls for all elements */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('editor.position')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={element.x}
                    onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
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
              <Label>{t('editor.size')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.width')}</Label>
                  <Input
                    type="number"
                    value={element.width}
                    onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.height')}</Label>
                  <Input
                    type="number"
                    value={element.height}
                    onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('editor.rotation')}</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[element.rotation || 0]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) => onUpdate({ rotation: value[0] })}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{element.rotation || 0}°</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('editor.hyperlink')}</Label>
              <Input
                type="url"
                value={element.hyperlink || ''}
                onChange={(e) => onUpdate({ hyperlink: e.target.value })}
                placeholder="https://..."
                className="h-8"
              />
            </div>
          </div>

          {/* Advanced layout options */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{t('editor.advancedOptions')}</span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t('editor.zIndex')}</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[element.zIndex || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => onUpdate({ zIndex: value[0] })}
                      className="flex-1"
                    />
                    <span className="text-sm w-8 text-right">{element.zIndex || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
