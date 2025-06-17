
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCardButton } from '@/components/EnhancedCardButton';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

interface CardGridProps {
  cards: Flashcard[];
  setId: string;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  defaultTemplate?: CardTemplate;
  onBrowseTemplates?: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  setId,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  defaultTemplate,
  onBrowseTemplates,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleAddCard = () => {
    if (onBrowseTemplates) {
      onBrowseTemplates();
    }
  };

  const handleCardClick = (cardIndex: number) => {
    navigate(`/edit/${setId}/${cardIndex}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card 
          key={card.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick(index)}
        >
          <CardHeader>
            <CardTitle className="text-sm">Card {index + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Front</h4>
                <p className="text-sm line-clamp-2">{card.question || 'No question text'}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Back</h4>
                <p className="text-sm line-clamp-2">{card.answer || 'No answer text'}</p>
              </div>
              {card.front_elements && card.front_elements.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {card.front_elements.length} element(s) on front
                </div>
              )}
              {card.back_elements && card.back_elements.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {card.back_elements.length} element(s) on back
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <EnhancedCardButton
            onCreateCard={handleAddCard}
            onCreateFromTemplate={onCreateFromTemplate}
            onSetDefaultTemplate={onSetDefaultTemplate}
            defaultTemplate={defaultTemplate}
            onBrowseTemplates={onBrowseTemplates}
          />
        </CardContent>
      </Card>
    </div>
  );
};
