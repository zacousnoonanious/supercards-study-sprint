
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

  const handleCardTypeChange = (value: string) => {
    console.log('Card type changed to:', value);
    onUpdateCard({ card_type: value as Flashcard['card_type'] });
  };

  const handleTimerChange = (value: string) => {
    const timer = parseInt(value) || 0;
    console.log('Timer changed to:', timer);
    onUpdateCard({ countdown_timer: timer });
  };

  const handlePasswordChange = (value: string) => {
    console.log('Password changed');
    onUpdateCard({ password: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
          Card Type
        </Label>
        <Select 
          value={card.card_type || 'standard'} 
          onValueChange={handleCardTypeChange}
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

      {/* Show timer for timed-challenge cards or any card type that needs timing */}
      {(card.card_type === 'timed-challenge' || card.card_type === 'quiz-only') && (
        <div>
          <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
            Countdown Timer (seconds)
          </Label>
          <Input
            type="number"
            min="0"
            value={card.countdown_timer || 0}
            onChange={(e) => handleTimerChange(e.target.value)}
            className={`mt-1 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            placeholder="0 = No timer"
          />
        </div>
      )}

      {/* Show password field for password-protected cards */}
      {card.card_type === 'password-protected' && (
        <div>
          <Label className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
            Password
          </Label>
          <Input
            type="password"
            value={card.password || ''}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={`mt-1 ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            placeholder="Enter password"
          />
        </div>
      )}

      {/* Show informational text for different card types */}
      <div className={`text-xs p-3 rounded ${isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        {card.card_type === 'informational' && (
          <p>Information cards display content in full-screen mode without flipping.</p>
        )}
        {card.card_type === 'single-sided' && (
          <p>Single-sided cards only show the front side and cannot be flipped.</p>
        )}
        {card.card_type === 'quiz-only' && (
          <p>Quiz-only cards focus on interactive elements like multiple choice questions.</p>
        )}
        {card.card_type === 'timed-challenge' && (
          <p>Timed challenge cards have a countdown timer for time-limited interactions.</p>
        )}
        {card.card_type === 'password-protected' && (
          <p>Password-protected cards require authentication before viewing content.</p>
        )}
        {card.card_type === 'standard' && (
          <p>Standard cards are traditional front/back flashcards with all features available.</p>
        )}
      </div>
    </div>
  );
};
