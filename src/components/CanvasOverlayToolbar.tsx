
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Save, Trash2, Copy, Sparkles, CheckSquare, ToggleLeft, FileText, Youtube, Layers, Volume2, Pencil } from 'lucide-react';
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
}) => {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  const deleteCard = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (confirmDelete) {
      return await onDeleteCard();
    }
    return false;
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-20">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left section - Add elements */}
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddElement('multiple-choice')}
              className="h-8 px-2"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              <span className="text-xs">Quiz</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddElement('true-false')}
              className="h-8 px-2"
            >
              <ToggleLeft className="w-3 h-3 mr-1" />
              <span className="text-xs">T/F</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddElement('fill-in-blank')}
              className="h-8 px-2"
            >
              <FileText className="w-3 h-3 mr-1" />
              <span className="text-xs">Fill</span>
            </Button>
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

          {/* Center section - Navigation */}
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
            
            <span className="text-xs text-muted-foreground px-2">
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
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-1">
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
    </div>
  );
};
