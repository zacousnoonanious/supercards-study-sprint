
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardTemplate } from '@/types/flashcard';
import { cardTemplates } from '@/data/cardTemplates';
import { Plus, LayoutTemplate, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';

interface NewCardTemplateSelectorProps {
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate?: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
  showAsDialog?: boolean;
  title?: string;
}

export const NewCardTemplateSelector: React.FC<NewCardTemplateSelectorProps> = ({
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate,
  showAsDialog = true,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const dialogTitle = title || t('editor.chooseCardTemplate');

  const handleTemplateSelect = (template: CardTemplate) => {
    onCreateFromTemplate(template);
    setIsOpen(false);
  };

  const handleSetDefault = (template: CardTemplate) => {
    onSetDefaultTemplate?.(template);
  };

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blank Card Option */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
          onCreateCard();
          setIsOpen(false);
        }}>
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-12 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">{t('editor.blankCard')}</h3>
              <p className="text-sm text-muted-foreground">{t('editor.startWithEmpty')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Template Options */}
        {cardTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:border-primary transition-colors relative"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{template.name}</h3>
                  {defaultTemplate?.id === template.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="text-xs text-muted-foreground">
                  {template.canvas_width} × {template.canvas_height}
                </div>
                {onSetDefaultTemplate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(template);
                    }}
                    className="mt-2"
                  >
                    {defaultTemplate?.id === template.id ? t('common.default') : t('common.setAsDefault')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!showAsDialog) {
    return content;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <LayoutTemplate className="w-4 h-4" />
        {t('editor.chooseTemplate')}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  );
};
