
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { EditableDeckTitle } from './EditableDeckTitle';

interface TopToolbarProps {
  deckName: string;
  currentCardIndex: number;
  cards: Flashcard[];
  showShortcuts: boolean;
  showCardOverview: boolean;
  onDeckTitleChange: (title: string) => Promise<void>;
  onShowCardOverviewChange: (show: boolean) => void;
  collaborationDialog?: React.ReactNode;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  deckName,
  currentCardIndex,
  cards,
  showShortcuts,
  showCardOverview,
  onDeckTitleChange,
  onShowCardOverviewChange,
  collaborationDialog,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <EditableDeckTitle
          title={deckName}
          onTitleUpdate={onDeckTitleChange}
        />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Card {currentCardIndex + 1} of {cards.length}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {collaborationDialog}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowCardOverviewChange(!showCardOverview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Overview
        </Button>
        
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
