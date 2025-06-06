
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flashcard } from '@/types/flashcard';

interface CountdownBehaviorSelectorProps {
  card: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const CountdownBehaviorSelector: React.FC<CountdownBehaviorSelectorProps> = ({
  card,
  onUpdateCard,
}) => {
  const isSingleSided = card.card_type === 'single-sided';
  
  return (
    <div>
      <Label className="text-sm font-medium">When countdown expires</Label>
      <Select
        value={card.countdown_behavior || (isSingleSided ? 'next' : 'flip')}
        onValueChange={(value: 'flip' | 'next') => onUpdateCard({ countdown_behavior: value })}
        disabled={isSingleSided}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {!isSingleSided && (
            <SelectItem value="flip">Flip to back side</SelectItem>
          )}
          <SelectItem value="next">Proceed to next card</SelectItem>
        </SelectContent>
      </Select>
      {isSingleSided && (
        <p className="text-xs text-gray-500 mt-1">
          Single-sided cards automatically proceed to next card
        </p>
      )}
    </div>
  );
};
