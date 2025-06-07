
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
  Settings,
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
  position?: 'left' | 'top' | 'right' | 'bottom';
  onPositionChange?: (position: 'left' | 'top' | 'right' | 'bottom') => void;
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
  position = 'left',
  onPositionChange,
}) => {
  const isHorizontal = position === 'top' || position === 'bottom';
  
  const getPositionStyles = () => {
    const baseClasses = "bg-background border rounded-lg shadow-lg p-2 gap-2 z-50";
    
    switch (position) {
      case 'left':
        return `${baseClasses} flex flex-col w-16`;
      case 'right':
        return `${baseClasses} flex flex-col w-16`;
      case 'top':
        return `${baseClasses} flex flex-row h-16 min-w-max`;
      case 'bottom':
        return `${baseClasses} flex flex-row h-16 min-w-max`;
      default:
        return `${baseClasses} flex flex-col w-16`;
    }
  };

  const buttonSizeClass = isHorizontal ? "w-12 h-12" : "w-12 h-10";
  const separatorClass = isHorizontal ? "h-full w-px bg-border" : "w-full h-px bg-border";

  return (
    <div className={getPositionStyles()}>
      {/* Position Settings */}
      {onPositionChange && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const positions: ('left' | 'top' | 'right' | 'bottom')[] = ['left', 'top', 'right', 'bottom'];
              const currentIndex = positions.indexOf(position);
              const nextPosition = positions[(currentIndex + 1) % positions.length];
              onPositionChange(nextPosition);
            }}
            className={`${buttonSizeClass} p-0`}
            title="Change Position"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <div className={separatorClass} />
        </>
      )}

      {/* Card Navigation */}
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateCard('prev')}
          disabled={currentCardIndex === 0}
          className={`${buttonSizeClass} p-0`}
          title="Previous Card"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {!isHorizontal && (
          <div className="text-xs text-center py-1 text-muted-foreground">
            {currentCardIndex + 1}/{totalCards}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex === totalCards - 1}
          className={`${buttonSizeClass} p-0`}
          title="Next Card"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Side Toggle */}
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <Button
          variant={currentSide === 'front' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('front')}
          className={`${isHorizontal ? 'w-16 h-8' : 'w-12 h-8'} p-0 text-xs`}
        >
          Front
        </Button>
        <Button
          variant={currentSide === 'back' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSideChange('back')}
          className={`${isHorizontal ? 'w-16 h-8' : 'w-12 h-8'} p-0 text-xs`}
        >
          Back
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Add Elements */}
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('text')}
          className={`${buttonSizeClass} p-0`}
          title="Add Text"
        >
          <Type className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('image')}
          className={`${buttonSizeClass} p-0`}
          title="Add Image"
        >
          <Image className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('audio')}
          className={`${buttonSizeClass} p-0`}
          title="Add Audio"
        >
          <Volume2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('multiple-choice')}
          className={`${buttonSizeClass} p-0`}
          title="Multiple Choice"
        >
          <CheckSquare className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('youtube')}
          className={`${buttonSizeClass} p-0`}
          title="Add YouTube Video"
        >
          <Youtube className="w-4 h-4" />
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Quick Actions */}
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAutoArrange('grid')}
          className={`${buttonSizeClass} p-0`}
          title="Grid Layout"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAutoArrange('center')}
          className={`${buttonSizeClass} p-0`}
          title="Center Elements"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
      </div>

      <div className={separatorClass} />

      {/* Card Actions */}
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-1`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNewCard}
          className={`${buttonSizeClass} p-0`}
          title="New Card"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteCard}
          className={`${buttonSizeClass} p-0 text-destructive hover:text-destructive`}
          title="Delete Card"
          disabled={totalCards <= 1}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
