
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Ban
} from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface ElementControlsProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
}

export const ElementControls: React.FC<ElementControlsProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const { t } = useI18n();

  if (!selectedElement) return null;

  const handleElementUpdate = (updates: Partial<CanvasElement>) => {
    onUpdateElement(selectedElement.id, updates);
  };

  return (
    <Card className="flex-shrink-0">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">{t('editor.element') || 'Element'}:</Label>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="h-7 px-2"
          >
            <Trash2 className="w-3 h-3" />
            <span className="ml-1 text-xs">{t('common.delete') || 'Delete'}</span>
          </Button>
          
          {selectedElement.type === 'text' && (
            <>
              {/* Text Style Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedElement.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ 
                    fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  className="h-7 px-2"
                  title={t('editor.bold') || 'Bold'}
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ 
                    fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  className="h-7 px-2"
                  title={t('editor.italic') || 'Italic'}
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ 
                    textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
                  })}
                  className="h-7 px-2"
                  title={t('editor.underline') || 'Underline'}
                >
                  <Underline className="w-3 h-3" />
                </Button>
              </div>

              {/* Text Alignment Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ textAlign: 'left' })}
                  className="h-7 px-2"
                  title={t('editor.alignLeft') || 'Align Left'}
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ textAlign: 'center' })}
                  className="h-7 px-2"
                  title={t('editor.alignCenter') || 'Align Center'}
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ textAlign: 'right' })}
                  className="h-7 px-2"
                  title={t('editor.alignRight') || 'Align Right'}
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
                <Button
                  variant={selectedElement.textAlign === 'justify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleElementUpdate({ textAlign: 'justify' })}
                  className="h-7 px-2"
                  title={t('editor.alignJustify') || 'Justify'}
                >
                  <AlignJustify className="w-3 h-3" />
                </Button>
              </div>

              {/* Color and Font Size */}
              <div className="flex items-center gap-1">
                <Input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => handleElementUpdate({ color: e.target.value })}
                  className="w-8 h-7 p-0 border-0"
                  title={t('editor.textColor') || 'Text Color'}
                />
                <Input
                  type="number"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => handleElementUpdate({ fontSize: Number(e.target.value) })}
                  className="w-16 h-7 text-xs"
                  min="8"
                  max="72"
                  placeholder={t('editor.size') || 'Size'}
                />
              </div>

              {/* Font Family */}
              <Select
                value={selectedElement.fontFamily || 'Arial'}
                onValueChange={(value) => handleElementUpdate({ fontFamily: value })}
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue placeholder={t('editor.font') || 'Font'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Courier New">Courier</SelectItem>
                </SelectContent>
              </Select>

              {/* Background Color */}
              <div className="flex items-center gap-1">
                <Label className="text-xs">{t('editor.bg') || 'BG'}:</Label>
                <Input
                  type="color"
                  value={(selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent') ? selectedElement.backgroundColor : '#ffffff'}
                  onChange={(e) => handleElementUpdate({ backgroundColor: e.target.value })}
                  className="w-8 h-7 p-0 border-0"
                  title={t('editor.backgroundColor') || 'Background Color'}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleElementUpdate({ backgroundColor: 'transparent' })}
                  className="h-7 w-7 p-1"
                  title={t('editor.clearBackgroundColor') || 'Clear Background Color'}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
