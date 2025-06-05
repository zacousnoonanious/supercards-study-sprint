
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Flashcard } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface CardTypeSelectorProps {
  card: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({ card, onUpdateCard }) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';

  const cardTypes = [
    { value: 'standard', label: 'Standard Card', description: 'Regular front/back flashcard' },
    { value: 'informational', label: 'Information Card', description: 'Full-screen display card' },
    { value: 'single-sided', label: 'Single-Sided', description: 'Only front side, no flip' },
    { value: 'password-protected', label: 'Password Protected', description: 'Requires password to view' },
    { value: 'quiz-only', label: 'Quiz Only', description: 'Interactive quiz elements only' },
    { value: 'timed-challenge', label: 'Timed Challenge', description: 'Time-limited interaction' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
          Card Type
        </Label>
        <Select 
          value={card.card_type || 'standard'} 
          onValueChange={(value) => onUpdateCard({ card_type: value as Flashcard['card_type'] })}
        >
          <SelectTrigger className={`mt-1 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={isDarkTheme ? 'bg-gray-800 border-gray-600' : ''}>
            {cardTypes.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className={isDarkTheme ? 'text-white hover:bg-gray-700' : ''}
              >
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                    {type.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
          Countdown Timer (seconds)
        </Label>
        <Input
          type="number"
          min="0"
          value={card.countdown_timer || 0}
          onChange={(e) => onUpdateCard({ countdown_timer: parseInt(e.target.value) || 0 })}
          className={`mt-1 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
          placeholder="0 = No timer"
        />
      </div>

      {card.card_type === 'password-protected' && (
        <div>
          <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
            Password
          </Label>
          <Input
            type="password"
            value={card.password || ''}
            onChange={(e) => onUpdateCard({ password: e.target.value })}
            className={`mt-1 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            placeholder="Enter password"
          />
        </div>
      )}
    </div>
  );
};
