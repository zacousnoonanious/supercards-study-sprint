
import React from 'react';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SimpleEditorFooterProps {
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  selectedElement: CanvasElement | null;
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  cardWidth: number;
}

export const SimpleEditorFooter: React.FC<SimpleEditorFooterProps> = ({
  currentCard,
  currentCardIndex,
  totalCards,
  selectedElement,
  onUpdateCard,
  onNavigateCard,
  cardWidth,
}) => {
  const { theme } = useTheme();

  const handleCardUpdate = (field: keyof Flashcard, value: any) => {
    onUpdateCard(currentCard.id, { [field]: value });
  };

  const getCountdownDisplay = () => {
    if (!currentCard.countdown_timer || currentCard.countdown_timer === 0) {
      return 'No countdown';
    }
    
    const seconds = currentCard.countdown_timer;
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}min`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`border-t p-3 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}
      style={{ width: cardWidth }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateCard('prev')}
            disabled={currentCardIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentCardIndex + 1} of {totalCards}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2">
          <Label htmlFor="countdown" className="text-xs whitespace-nowrap">Timer:</Label>
          <Select
            value={currentCard.countdown_timer?.toString() || '0'}
            onValueChange={(value) => handleCardUpdate('countdown_timer', parseInt(value))}
          >
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue placeholder={getCountdownDisplay()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No timer</SelectItem>
              <SelectItem value="1">1s</SelectItem>
              <SelectItem value="2">2s</SelectItem>
              <SelectItem value="3">3s</SelectItem>
              <SelectItem value="4">4s</SelectItem>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="20">20s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1min</SelectItem>
              <SelectItem value="120">2min</SelectItem>
              <SelectItem value="180">3min</SelectItem>
              <SelectItem value="300">5min</SelectItem>
              <SelectItem value="600">10min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Element Position/Size Display */}
        {selectedElement && (
          <div className="flex items-center gap-3 text-xs">
            <span>X: {Math.round(selectedElement.x)}</span>
            <span>Y: {Math.round(selectedElement.y)}</span>
            <span>W: {Math.round(selectedElement.width)}</span>
            <span>H: {Math.round(selectedElement.height)}</span>
          </div>
        )}

        {/* Creation Date */}
        <div className="text-xs text-muted-foreground">
          Created: {formatDate(currentCard.created_at)}
        </div>
      </div>
    </div>
  );
};
