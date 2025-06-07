
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Type,
  Image,
  Volume2,
  Pencil,
  CheckSquare,
  ToggleLeft,
  Youtube,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  RotateCw,
  Grid3X3,
  AlignCenter,
  Trash2,
} from 'lucide-react';
import { Flashcard } from '@/types/flashcard';

interface ConsolidatedToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right') => void;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: string) => void;
}

export const ConsolidatedToolbar: React.FC<ConsolidatedToolbarProps> = ({
  onAddElement,
  onAutoArrange,
  currentCard,
  currentCardIndex,
  totalCards,
  currentSide,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onDeleteCard,
  onCardTypeChange,
}) => {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-2 flex flex-col gap-2 w-16">
        {/* Card Navigation */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateCard('prev')}
            disabled={currentCardIndex === 0}
            className="w-12 h-10 p-0"
            title="Previous Card"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-xs text-center py-1 text-muted-foreground">
            {currentCardIndex + 1}/{totalCards}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
            className="w-12 h-10 p-0"
            title="Next Card"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Side Toggle */}
        <div className="flex flex-col gap-1">
          <Button
            variant={currentSide === 'front' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange('front')}
            className="w-12 h-8 p-0 text-xs"
          >
            Front
          </Button>
          <Button
            variant={currentSide === 'back' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange('back')}
            className="w-12 h-8 p-0 text-xs"
          >
            Back
          </Button>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Add Elements */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('text')}
            className="w-12 h-10 p-0"
            title="Add Text"
          >
            <Type className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('image')}
            className="w-12 h-10 p-0"
            title="Add Image"
          >
            <Image className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('audio')}
            className="w-12 h-10 p-0"
            title="Add Audio"
          >
            <Volume2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('multiple-choice')}
            className="w-12 h-10 p-0"
            title="Multiple Choice"
          >
            <CheckSquare className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('youtube')}
            className="w-12 h-10 p-0"
            title="Add YouTube Video"
          >
            <Youtube className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Quick Actions */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAutoArrange('grid')}
            className="w-12 h-10 p-0"
            title="Grid Layout"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAutoArrange('center')}
            className="w-12 h-10 p-0"
            title="Center Elements"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Card Actions */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNewCard}
            className="w-12 h-10 p-0"
            title="New Card"
          >
            <Plus className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteCard}
            className="w-12 h-10 p-0 text-destructive hover:text-destructive"
            title="Delete Card"
            disabled={totalCards <= 1}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
