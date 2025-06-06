
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ChevronLeft, ChevronRight, Save, Trash2, Copy, Sparkles, CheckSquare, ToggleLeft, FileText, Youtube, Layers, Volume2, Pencil, Settings, ChevronDown, Grid3X3, AlignCenter, AlignJustify, Layers3, Clock } from 'lucide-react';
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
  onDeleteCard,
  onSave,
  onAutoArrange,
  isCompact = false,
  orientation = 'horizontal',
  isBackSideDisabled = false,
}) => {
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
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

  const getCardTypeLabel = (cardType: Flashcard['card_type']) => {
    switch (cardType) {
      case 'standard': return isCompact ? 'S' : 'Standard';
      case 'informational': return isCompact ? 'I' : 'Info';
      case 'single-sided': return isCompact ? 'SS' : 'Single';
      default: return isCompact ? 'S' : 'Standard';
    }
  };

  const containerClass = orientation === 'vertical' 
    ? isCompact 
      ? "flex flex-col items-center gap-1 w-full"
      : "grid grid-cols-2 gap-1 w-full max-w-[200px]"
    : "flex items-center justify-between gap-1 flex-wrap min-h-[36px]";

  const sectionClass = orientation === 'vertical'
    ? isCompact
      ? "flex flex-col items-center gap-1 w-full"
      : "grid grid-cols-2 gap-1 w-full"
    : "flex items-center gap-1 flex-wrap";

  const buttonSize = isCompact ? "h-6 w-6 p-0" : "h-8 px-2";
  const iconSize = isCompact ? "w-3 h-3" : "w-3 h-3";

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
              <span className="text-xs">Text</span>
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
          {isCompact ? <img className={iconSize} /> : (
            <>
              <img className={`${iconSize} mr-1`} />
              <span className="text-xs">Image</span>
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
                  <span className="text-xs">Quiz</span>
                  <ChevronDown className={`${iconSize} ml-1`} />
                </>
              )}
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
          className={buttonSize}
          title="Add Video"
        >
          {isCompact ? <Youtube className={iconSize} /> : (
            <>
              <Youtube className={`${iconSize} mr-1`} />
              <span className="text-xs">Video</span>
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
              <span className="text-xs">Deck</span>
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
              <span className="text-xs">Audio</span>
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
              <span className="text-xs">Draw</span>
            </>
          )}
        </Button>
        
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
                  <span className="text-xs">AI</span>
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
        
        <span className={`text-xs text-muted-foreground px-2 whitespace-nowrap ${isCompact ? 'text-[10px]' : ''}`}>
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
            size="sm"
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
                  <span className="text-xs">{getCardTypeLabel(currentCard?.card_type || 'standard')}</span>
                </>
              )}
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Countdown Timer */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={buttonSize}
              title="Countdown Timer"
            >
              {isCompact ? <Clock className={iconSize} /> : (
                <>
                  <Clock className={`${iconSize} mr-1`} />
                  <span className="text-xs">{countdownTimer}s</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-white dark:bg-gray-800 border shadow-lg z-50">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Countdown Timer (seconds)</Label>
              <Input
                type="number"
                value={countdownTimer}
                onChange={(e) => handleCountdownTimerChange(parseInt(e.target.value) || 0)}
                min="0"
                max="300"
                className="w-full"
              />
              <p className="text-xs text-gray-500">Set to 0 to disable timer</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right section - Actions */}
      <div className={sectionClass}>
        {/* Arrange Dropdown */}
        {onAutoArrange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={buttonSize}
                title="Arrange elements"
              >
                {isCompact ? <Grid3X3 className={iconSize} /> : (
                  <>
                    <Grid3X3 className={`${iconSize} mr-1`} />
                    <span className="text-xs">Arrange</span>
                    <ChevronDown className={`${iconSize} ml-1`} />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 border shadow-lg z-50">
              <DropdownMenuLabel>Layout Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAutoArrange('grid')}>
                <Grid3X3 className="w-3 h-3 mr-2" />
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange('center')}>
                <AlignCenter className="w-3 h-3 mr-2" />
                Center All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange('justify')}>
                <AlignJustify className="w-3 h-3 mr-2" />
                Justify
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange('stack')}>
                <Layers3 className="w-3 h-3 mr-2" />
                Stack
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNewCard}
          className={buttonSize}
          title="New Card"
        >
          {isCompact ? <Plus className={iconSize} /> : (
            <>
              <Plus className={`${iconSize} mr-1`} />
              <span className="text-xs">New</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNewCardWithLayout}
          className={buttonSize}
          title="Copy all elements to new card"
        >
          {isCompact ? <Copy className={iconSize} /> : (
            <>
              <Copy className={`${iconSize} mr-1`} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteCard}
          className={`${buttonSize} text-red-600 hover:text-red-700`}
          title="Delete Card"
        >
          {isCompact ? <Trash2 className={iconSize} /> : (
            <>
              <Trash2 className={`${iconSize} mr-1`} />
              <span className="text-xs">Delete</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={buttonSize}
          title="Save"
        >
          {isCompact ? <Save className={iconSize} /> : (
            <>
              <Save className={`${iconSize} mr-1`} />
              <span className="text-xs">Save</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
