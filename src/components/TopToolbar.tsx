
import React from 'react';
import { Flashcard } from '@/types/flashcard';
import { EditableDeckTitle } from './EditableDeckTitle';
import { Button } from './ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface TopToolbarProps {
  deckName: string;
  currentCardIndex: number;
  cards: Flashcard[];
  showShortcuts: boolean;
  showCardOverview: boolean;
  onDeckTitleChange: (title: string) => void;
  onShowCardOverviewChange: (show: boolean) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  deckName,
  currentCardIndex,
  cards,
  showShortcuts,
  showCardOverview,
  onDeckTitleChange,
  onShowCardOverviewChange,
}) => {
  return (
    <div className="border-b p-4 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <EditableDeckTitle
            title={deckName}
            onChange={onDeckTitleChange}
          />
          <span className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {cards.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowCardOverviewChange(!showCardOverview)}
          >
            {showCardOverview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCardOverview ? 'Hide Overview' : 'Show Overview'}
          </Button>
        </div>
      </div>
    </div>
  );
};
