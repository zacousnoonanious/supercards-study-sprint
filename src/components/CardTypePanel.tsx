
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CardTypeSelector } from './CardTypeSelector';
import { Flashcard } from '@/types/flashcard';

interface CardTypePanelProps {
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const CardTypePanel: React.FC<CardTypePanelProps> = ({
  currentCard,
  onUpdateCard,
}) => {
  return (
    <div className="absolute top-1 right-1 z-30 pointer-events-none">
      <Card className="bg-white/90 backdrop-blur-sm border shadow-sm pointer-events-auto w-64">
        <CardContent className="p-2">
          <CardTypeSelector
            card={currentCard}
            onUpdateCard={(updates) => onUpdateCard(updates)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
