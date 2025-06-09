import React, { useState, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
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

  if (!element) return null;

  return (
    <div className="w-64 p-4 border-l bg-background overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t('editor.elementOptions')}</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Common controls for all elements */}
      <div className="space-y-4 mb-4">
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

      {/* Text-specific controls */}
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
            <Label>{t('editor.textAlign')}</Label>
            <div className="flex space-x-1">
              <Button
                variant={element.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => onUpdate({ textAlign: 'left' })}
              >
                {t('editor.left')}
              </Button>
              <Button
                variant={element.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => onUpdate({ textAlign: 'center' })}
              >
                {t('editor.center')}
              </Button>
              <Button
                variant={element.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-8"
                onClick={() => onUpdate({ textAlign: 'right' })}
              >
                {t('editor.right')}
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
                B
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
                I
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
                U
              </Button>
            </div>
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

      {/* Fill-in-blank specific controls */}
      {element.type === 'fill-in-blank' && (
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

      {/* Image-specific controls */}
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
        </div>
      )}

      {/* Advanced options toggle */}
      <div className="mt-4 pt-4 border-t">
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
    </div>
  );
};
