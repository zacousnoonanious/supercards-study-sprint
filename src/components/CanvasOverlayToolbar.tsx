
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Save, Trash2, Copy, Sparkles, CheckSquare, ToggleLeft, FileText, Youtube, Layers, Volume2, Pencil, Settings, ChevronDown, Grid3X3 } from 'lucide-react';
import { CardSideToggle } from './CardSideToggle';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { AIFlashcardGenerator } from './AIFlashcardGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CanvasOverlayToolbarProps {
  set: FlashcardSet;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onAddElement: (type: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onDeleteCard: () => Promise<boolean>;
  onSave: () => void;
  onAutoArrange?: () => void;
}

export const CanvasOverlayToolbar: React.FC<CanvasOverlayToolbarProps> = ({
  set,
  currentCard,
  currentCardIndex,
  totalCards,
  currentSide,
  onAddElement,
  onUpdateCard,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onDeleteCard,
  onSave,
  onAutoArrange,
}) => {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const deleteCard = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (confirmDelete) {
      return await onDeleteCard();
    }
    return false;
  };

  const handleCardTypeChange = (cardType: Flashcard['card_type']) => {
    onUpdateCard(currentCard.id, { card_type: cardType });
  };

  const getCardTypeLabel = (cardType: Flashcard['card_type']) => {
    switch (cardType) {
      case 'standard': return 'Standard';
      case 'informational': return 'Info';
      case 'single-sided': return 'Single';
      case 'password-protected': return 'Protected';
      case 'quiz-only': return 'Quiz';
      default: return 'Standard';
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
      <div className="flex items-center justify-between gap-1 flex-wrap min-h-[36px]">
        {/* Left section - Add elements */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('text')}
            className="h-8 px-2"
          >
            <span className="text-xs">Text</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('image')}
            className="h-8 px-2"
          >
            <span className="text-xs">Image</span>
          </Button>
          
          {/* Quiz Elements Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                <span className="text-xs">Quiz</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white dark:bg-gray-800 border shadow-lg z-50">
              <DropdownMenuLabel>Quiz Elements</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddElement('multiple-choice')}>
                <CheckSquare className="w-3 h-3 mr-2" />
                Multiple Choice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('true-false')}>
                <ToggleLeft className="w-3 h-3 mr-2" />
                True/False
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('fill-in-blank')}>
                <FileText className="w-3 h-3 mr-2" />
                Fill in Blank
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('youtube')}
            className="h-8 px-2"
          >
            <Youtube className="w-3 h-3 mr-1" />
            <span className="text-xs">Video</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('deck-embed')}
            className="h-8 px-2"
          >
            <Layers className="w-3 h-3 mr-1" />
            <span className="text-xs">Deck</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('audio')}
            className="h-8 px-2"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            <span className="text-xs">Audio</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('drawing')}
            className="h-8 px-2"
          >
            <Pencil className="w-3 h-3 mr-1" />
            <span className="text-xs">Draw</span>
          </Button>
          
          <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-indigo-600"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                <span className="text-xs">AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add AI-Generated Cards</DialogTitle>
              </DialogHeader>
              <AIFlashcardGenerator
                setId={set.id}
                mode="add-to-set"
                onGenerated={() => {
                  setIsAIDialogOpen(false);
                  window.location.reload(); // Refresh to show new cards
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Center section - Navigation and Card Type */}
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
          
          <span className="text-xs text-muted-foreground px-2 whitespace-nowrap">
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

          <CardSideToggle
            currentSide={currentSide}
            onSideChange={onSideChange}
            size="sm"
          />

          {/* Card Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <Settings className="w-3 h-3 mr-1" />
                <span className="text-xs">{getCardTypeLabel(currentCard?.card_type || 'standard')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 bg-white dark:bg-gray-800 border shadow-lg z-50">
              <DropdownMenuLabel>Card Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCardTypeChange('standard')}>
                Standard Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCardTypeChange('informational')}>
                Informational
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCardTypeChange('single-sided')}>
                Single Sided
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCardTypeChange('password-protected')}>
                Password Protected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCardTypeChange('quiz-only')}>
                Quiz Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
          {onAutoArrange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAutoArrange}
              className="h-8 px-2"
              title="Auto-arrange elements"
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              <span className="text-xs">Arrange</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNewCard}
            className="h-8 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="text-xs">New</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNewCardWithLayout}
            className="h-8 px-2"
            title="Copy all elements to new card"
          >
            <Copy className="w-3 h-3 mr-1" />
            <span className="text-xs">Copy</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteCard}
            className="h-8 px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            <span className="text-xs">Delete</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="h-8 px-2"
          >
            <Save className="w-3 h-3 mr-1" />
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
