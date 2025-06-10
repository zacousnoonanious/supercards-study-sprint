
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';
import { Flashcard } from '@/types/flashcard';

interface CardTypeSelectorProps {
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({
  currentCard,
  onUpdateCard,
}) => {
  const { t } = useI18n();

  const cardTypes = [
    { value: 'normal', label: t('editor.normal') },
    { value: 'simple', label: t('editor.simple') },
    { value: 'informational', label: t('editor.informational') },
    { value: 'single-sided', label: t('editor.singleSided') },
    { value: 'quiz-only', label: t('editor.quizOnly') },
    { value: 'password-protected', label: t('editor.passwordProtected') },
  ];

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium whitespace-nowrap">
        {t('editor.cardType')}
      </Label>
      <Select
        value={currentCard.card_type || 'normal'}
        onValueChange={(value) => onUpdateCard({ card_type: value as Flashcard['card_type'] })}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cardTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
