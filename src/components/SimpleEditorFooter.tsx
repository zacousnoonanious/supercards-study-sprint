
import React from 'react';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
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

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

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
        isDarkTheme
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
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
          
          <span className={`text-sm ${
            isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'
          }`}>
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

        {/* Element Position/Size Display */}
        {selectedElement && (
          <div className={`flex items-center gap-3 text-xs ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span>X: {Math.round(selectedElement.x)}</span>
            <span>Y: {Math.round(selectedElement.y)}</span>
            <span>W: {Math.round(selectedElement.width)}</span>
            <span>H: {Math.round(selectedElement.height)}</span>
          </div>
        )}

        {/* Creation Date */}
        <div className={`text-xs ${
          isDarkTheme ? 'text-gray-400' : 'text-muted-foreground'
        }`}>
          Created: {formatDate(currentCard.created_at)}
        </div>
      </div>
    </div>
  );
};
