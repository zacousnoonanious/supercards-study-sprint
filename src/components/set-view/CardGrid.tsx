
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCardButton } from '@/components/EnhancedCardButton';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface CardGridProps {
  cards: Flashcard[];
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate,
}) => {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={card.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm">{t('setView.cardNumber').replace('{number}', (index + 1).toString())}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">{t('setView.front')}</h4>
                <p className="text-sm">{card.question}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">{t('setView.back')}</h4>
                <p className="text-sm">{card.answer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <EnhancedCardButton
            onCreateCard={onCreateCard}
            onCreateFromTemplate={onCreateFromTemplate}
            onSetDefaultTemplate={onSetDefaultTemplate}
            defaultTemplate={defaultTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
};
