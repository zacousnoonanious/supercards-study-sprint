import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ChevronLeft, ChevronRight, Save, Trash2, Copy, Sparkles, CheckSquare, ToggleLeft, FileText, Youtube, Layers, Volume2, Pencil, Settings, ChevronDown, Grid3X3, AlignCenter, AlignJustify, Layers3, Clock, Image, LayoutTemplate } from 'lucide-react';
import { CardSideToggle } from './CardSideToggle';
import { FlashcardSet, Flashcard, CardTemplate } from '@/types/flashcard';
import { AIFlashcardGenerator } from './AIFlashcardGenerator';
import { TemplateSelector } from './TemplateSelector';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => Promise<boolean>;
  onSave: () => void;
  onAutoArrange?: (type: 'grid' | 'center' | 'justify' | 'stack') => void;
  isCompact?: boolean;
  orientation?: 'horizontal' | 'vertical';
  isBackSideDisabled?: boolean;
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
  onCreateNewCardFromTemplate,
  onDeleteCard,
  onSave,
  onAutoArrange,
  isCompact = false,
  orientation = 'horizontal',
  isBackSideDisabled = false,
}) => {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(currentCard?.countdown_timer || 0);

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

  const handleCountdownTimerChange = (timer: number) => {
    setCountdownTimer(timer);
    onUpdateCard(currentCard.id, { countdown_timer: timer });
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    onCreateNewCardFromTemplate(template);
    setIsTemplateDialogOpen(false);
  };

  const getCardTypeLabel = (cardType: Flashcard['card_type']) => {
    switch (cardType) {
      case 'normal': return isCompact ? 'N' : 'Normal';
      case 'informational': return isCompact ? 'I' : 'Info';
      case 'single-sided': return isCompact ? 'SS' : 'Single';
      default: return isCompact ? 'N' : 'Normal';
    }
  };

  const containerClass = orientation === 'vertical' 
    ? isCompact 
      ? "flex flex-col items-center gap-1 w-full max-w-[180px]"
      : "grid grid-cols-2 gap-1 w-full max-w-[220px]"
    : "flex items-center justify-between gap-1 flex-wrap min-h-[36px] max-w-[90vw]";

  const sectionClass = orientation === 'vertical'
    ? isCompact
      ? "flex flex-col items-center gap-1 w-full"
      : "grid grid-cols-2 gap-1 w-full"
    : "flex items-center gap-1 flex-wrap";

  const buttonSize = isCompact ? "h-6 w-6 p-0" : "h-7 px-1.5";
  const iconSize = isCompact ? "w-3 h-3" : "w-3 h-3";
  const textSize = isCompact ? "text-[10px]" : "text-xs";

  return (
    <div className={containerClass}>
      {/* Left section - Add elements */}
      <div className={sectionClass}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('text')}
          className={buttonSize}
          title="Add Text"
        >
          {isCompact ? <FileText className={iconSize} /> : (
            <>
              <FileText className={`${iconSize} mr-1`} />
              <span className={textSize}>Text</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('image')}
          className={buttonSize}
          title="Add Image"
        >
          {isCompact ? <Image className={iconSize} /> : (
            <>
              <Image className={`${iconSize} mr-1`} />
              <span className={textSize}>Image</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('audio')}
          className={buttonSize}
          title="Add Audio"
        >
          {isCompact ? <Volume2 className={iconSize} /> : (
            <>
              <Volume2 className={`${iconSize} mr-1`} />
              <span className={textSize}>Audio</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('drawing')}
          className={buttonSize}
          title="Add Drawing"
        >
          {isCompact ? <Pencil className={iconSize} /> : (
            <>
              <Pencil className={`${iconSize} mr-1`} />
              <span className={textSize}>Draw</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('youtube')}
          className={buttonSize}
          title="Add YouTube Video"
        >
          {isCompact ? <Youtube className={iconSize} /> : (
            <>
              <Youtube className={`${iconSize} mr-1`} />
              <span className={textSize}>Video</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('deck-embed')}
          className={buttonSize}
          title="Embed Deck"
        >
          {isCompact ? <Layers className={iconSize} /> : (
            <>
              <Layers className={`${iconSize} mr-1`} />
              <span className={textSize}>Deck</span>
            </>
          )}
        </Button>
        
        {/* Quiz Elements Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={buttonSize}
              title="Quiz Elements"
            >
              {isCompact ? (
                <CheckSquare className={iconSize} />
              ) : (
                <>
                  <CheckSquare className={`${iconSize} mr-1`} />
                  <span className={textSize}>Quiz</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 bg-white dark:bg-gray-800 border shadow-lg z-50">
            <DropdownMenuLabel>Quiz</DropdownMenuLabel>
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
        
        <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${buttonSize} text-indigo-600`}
              title="AI Generate"
            >
              {isCompact ? <Sparkles className={iconSize} /> : (
                <>
                  <Sparkles className={`${iconSize} mr-1`} />
                  <span className={textSize}>AI</span>
                </>
              )}
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
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Center section - Navigation and Card Type */}
      <div className={sectionClass}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateCard('prev')}
          disabled={currentCardIndex === 0}
          className={buttonSize}
          title="Previous Card"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className={`${textSize} text-muted-foreground px-1 whitespace-nowrap`}>
          {currentCardIndex + 1}/{totalCards}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex === totalCards - 1}
          className={buttonSize}
          title="Next Card"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Compact Card Side Toggle */}
        {isCompact ? (
          <div className="flex gap-1 p-1 bg-muted rounded">
            <Button
              variant={currentSide === 'front' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSideChange('front')}
              className="h-5 w-5 p-0 text-[10px]"
              title="Front Side"
            >
              F
            </Button>
            <Button
              variant={currentSide === 'back' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSideChange('back')}
              className="h-5 w-5 p-0 text-[10px]"
              title="Back Side"
              disabled={isBackSideDisabled}
            >
              B
            </Button>
          </div>
        ) : (
          <CardSideToggle
            currentSide={currentSide}
            onSideChange={onSideChange}
            isBackDisabled={isBackSideDisabled}
          />
        )}

        {/* Card Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={buttonSize}
              title="Card Type"
            >
              {isCompact ? (
                <Settings className={iconSize} />
              ) : (
                <>
                  <Settings className={`${iconSize} mr-1`} />
                  <span className={textSize}>{getCardTypeLabel(currentCard?.card_type || 'normal')}</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40 bg-white dark:bg-gray-800 border shadow-lg z-50">
            <DropdownMenuLabel>Card Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCardTypeChange('normal')}>
              Normal Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCardTypeChange('informational')}>
              Informational
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCardTypeChange('single-sided')}>
              Single Sided
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right section - Actions */}
      <div className={sectionClass}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNewCard}
          className={buttonSize}
          title="New Card"
        >
          <Plus className={iconSize} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNewCardWithLayout}
          className={buttonSize}
          title="Copy Layout"
        >
          <Copy className={iconSize} />
        </Button>

        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={buttonSize}
              title="Templates"
            >
              <LayoutTemplate className={iconSize} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
            <TemplateSelector
              onSelectTemplate={handleTemplateSelect}
              onClose={() => setIsTemplateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteCard}
          className={`${buttonSize} text-red-600 hover:text-red-700`}
          title="Delete Card"
        >
          <Trash2 className={iconSize} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={buttonSize}
          title="Save"
        >
          <Save className={iconSize} />
        </Button>
      </div>

      {/* Template Selector */}
      {isTemplateDialogOpen && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setIsTemplateDialogOpen(false)}
        />
      )}
    </div>
  );
};
