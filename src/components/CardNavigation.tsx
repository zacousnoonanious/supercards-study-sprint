
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout?: () => void;
  onDeleteCard?: () => Promise<boolean>;
  cardType?: string;
}

export const CardNavigation: React.FC<CardNavigationProps> = ({
  currentIndex,
  totalCards,
  onNavigate,
  currentSide,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onDeleteCard,
  cardType,
}) => {
  const { toast } = useToast();

  const handleDeleteCard = async () => {
    if (!onDeleteCard) return;
    
    if (totalCards <= 1) {
      toast({
        title: "Cannot delete card",
        description: "You must have at least one card in the set.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this card? This action cannot be undone.');
    if (!confirmed) return;

    const success = await onDeleteCard();
    if (success) {
      toast({
        title: "Card deleted",
        description: "The card has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const showBackSide = cardType !== 'single-sided' && cardType !== 'informational';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('prev')}
          disabled={currentIndex === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        
        <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
          {currentIndex + 1} of {totalCards}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('next')}
          disabled={currentIndex === totalCards - 1}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {showBackSide && (
        <div className="flex gap-1 p-1 bg-muted rounded">
          <Button
            variant={currentSide === 'front' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSideChange('front')}
            className="text-xs"
          >
            Front
          </Button>
          <Button
            variant={currentSide === 'back' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSideChange('back')}
            className="text-xs"
          >
            Back
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNewCard}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Card</span>
        </Button>
        
        {onCreateNewCardWithLayout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateNewCardWithLayout}
            className="flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate Layout</span>
          </Button>
        )}

        {onDeleteCard && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteCard}
            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
};
