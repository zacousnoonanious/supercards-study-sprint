
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CountdownBehaviorSelector } from '@/components/CountdownBehaviorSelector';
import { AdvancedCountdownSettings } from '@/components/AdvancedCountdownSettings';
import { Flashcard } from '@/types/flashcard';

interface CardTypeSelectorProps {
  card: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({
  card,
  onUpdateCard,
}) => {
  const cardTypes = [
    { value: 'normal', label: 'Normal', description: 'Customizable front and back with flexible sizing' },
    { value: 'simple', label: 'Simple Flashcard', description: 'Standard 600×900 size with single text elements' },
    { value: 'informational', label: 'Informational', description: 'Large format (900×1800) for detailed content' },
    { value: 'single-sided', label: 'Single-sided', description: 'Only shows the front side' },
  ];

  const selectedType = cardTypes.find(type => type.value === card.card_type) || cardTypes[0];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Card Type</Label>
        <Select
          value={card.card_type || 'normal'}
          onValueChange={(value) => onUpdateCard({ card_type: value as Flashcard['card_type'] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cardTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legacy single timer (kept for backwards compatibility) */}
      <div>
        <Label className="text-sm font-medium">Legacy Timer (both sides)</Label>
        <Input
          type="number"
          min="0"
          value={card.countdown_timer || 0}
          onChange={(e) => onUpdateCard({ countdown_timer: parseInt(e.target.value) || 0 })}
          placeholder="0 = no timer"
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          This applies the same timer to both sides. Use Advanced Timer Settings below for more control.
        </p>
      </div>

      {card.countdown_timer && card.countdown_timer > 0 && (
        <CountdownBehaviorSelector
          card={card}
          onUpdateCard={onUpdateCard}
        />
      )}

      {/* Advanced Timer Settings */}
      <AdvancedCountdownSettings
        card={card}
        onUpdateCard={onUpdateCard}
      />

      <div>
        <Label className="text-sm font-medium">Hint</Label>
        <Textarea
          value={card.hint || ''}
          onChange={(e) => onUpdateCard({ hint: e.target.value })}
          placeholder="Optional hint for this card"
          className="w-full h-16 resize-none"
        />
      </div>
    </div>
  );
};
