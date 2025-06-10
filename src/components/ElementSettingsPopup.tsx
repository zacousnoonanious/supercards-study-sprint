
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

interface ElementSettingsPopupProps {
  element: CanvasElement;
  position: { x: number; y: number };
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onClose: () => void;
}

export const ElementSettingsPopup: React.FC<ElementSettingsPopupProps> = ({
  element,
  position,
  onUpdateElement,
  onDeleteElement,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <div
      className={`absolute z-50 w-64 p-3 rounded-lg shadow-lg border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-300'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm capitalize">
          {t(`editor.${element.type}Settings`) || `${element.type} Settings`}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-3">
        {element.type === 'text' && (
          <>
            <div>
              <Label htmlFor="content" className="text-xs">{t('editor.content') || 'Content'}</Label>
              <Input
                id="content"
                value={element.content || ''}
                onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                className="h-8 text-xs"
                placeholder={t('editor.enterTextContent') || 'Enter text content'}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fontSize" className="text-xs">{t('editor.fontSize') || 'Font Size'}</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={element.fontSize || 16}
                  onChange={(e) => onUpdateElement(element.id, { fontSize: parseInt(e.target.value) })}
                  className="h-8 text-xs"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-xs">{t('editor.color') || 'Color'}</Label>
                <Input
                  id="color"
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => onUpdateElement(element.id, { color: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement(element.id, { 
                  fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
                className="h-7 text-xs"
                title={t('editor.bold') || 'Bold'}
              >
                B
              </Button>
              <Button
                variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement(element.id, { 
                  fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className="h-7 text-xs"
                title={t('editor.italic') || 'Italic'}
              >
                I
              </Button>
              <Button
                variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateElement(element.id, { 
                  textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className="h-7 text-xs"
                title={t('editor.underline') || 'Underline'}
              >
                U
              </Button>
            </div>
          </>
        )}
        
        {element.type === 'image' && (
          <div>
            <Label htmlFor="imageUrl" className="text-xs">{t('editor.imageUrl') || 'Image URL'}</Label>
            <Input
              id="imageUrl"
              value={element.imageUrl || ''}
              onChange={(e) => onUpdateElement(element.id, { imageUrl: e.target.value })}
              className="h-8 text-xs"
              placeholder={t('editor.enterImageUrl') || 'Enter image URL'}
            />
          </div>
        )}

        {element.type === 'multiple-choice' && (
          <div>
            <Label className="text-xs">{t('editor.options') || 'Options'}</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {(element.multipleChoiceOptions || []).map((option, index) => (
                <div key={index} className="flex gap-1 items-center">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.multipleChoiceOptions || [])];
                      newOptions[index] = e.target.value;
                      onUpdateElement(element.id, { multipleChoiceOptions: newOptions });
                    }}
                    className="h-6 text-xs flex-1"
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant={element.correctAnswer === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateElement(element.id, { correctAnswer: index })}
                    className="h-6 w-6 p-0 text-xs"
                    title={t('editor.correctAnswer') || 'Correct Answer'}
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
                        
                        onUpdateElement(element.id, { 
                          multipleChoiceOptions: newOptions,
                          correctAnswer: newCorrectAnswer,
                          height: newHeight
                        });
                      }}
                      className="h-6 w-6 p-0 text-red-500"
                      title={t('common.delete') || 'Delete'}
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
                  
                  const newHeight = Math.max(element.height, 120 + (newOptions.length * 40));
                  
                  onUpdateElement(element.id, { 
                    multipleChoiceOptions: newOptions,
                    height: newHeight
                  });
                }}
                className="h-6 text-xs w-full"
              >
                {t('editor.addOption') || '+ Add Option'}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDeleteElement(element.id);
              onClose();
            }}
            className="text-xs w-full"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {t('editor.deleteElement') || 'Delete Element'}
          </Button>
        </div>
      </div>
    </div>
  );
};
