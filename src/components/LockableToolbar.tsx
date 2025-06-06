
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  LayoutDashboard,
  ListOrdered,
  List,
  Text,
  Copy,
  Save,
  Plus,
  ArrowLeft,
  ArrowRight,
  Trash,
  Settings,
  Download,
  Upload,
  HelpCircle,
  ChevronDown,
  Grid,
  Layers,
  Home,
  Volume2,
  Pencil,
  Youtube,
  CheckSquare,
  ToggleLeft,
  FileText,
  Maximize2,
  Move,
  RotateCw,
  Zap,
  Brain,
  FileQuestion,
  Sparkles,
} from "lucide-react";
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { useNavigate } from 'react-router-dom';

interface LockableToolbarProps {
  set: any;
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
  onAutoArrange?: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right') => void;
  isBackSideDisabled?: boolean;
}

export const LockableToolbar: React.FC<LockableToolbarProps> = ({
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
  isBackSideDisabled = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full h-14 bg-background/95 backdrop-blur-sm z-40 border-b border-border">
      <div className="container max-w-full h-full flex items-center justify-between px-2 gap-1">
        {/* Left Side - Back to Decks */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/decks')}
          className="h-8 px-2 text-xs"
        >
          <Home className="w-3 h-3 mr-1" />
          Decks
        </Button>

        {/* Element Tools */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" onClick={() => onAddElement('text')} className="h-8 w-8 p-0" title="Text">
            <Text className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('image')} className="h-8 w-8 p-0" title="Image">
            <ImageIcon className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('audio')} className="h-8 w-8 p-0" title="Audio">
            <Volume2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('drawing')} className="h-8 w-8 p-0" title="Drawing">
            <Pencil className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('youtube')} className="h-8 w-8 p-0" title="YouTube">
            <Youtube className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('deck-embed')} className="h-8 w-8 p-0" title="Embed Deck">
            <Layers className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('multiple-choice')} className="h-8 w-8 p-0" title="Multiple Choice">
            <CheckSquare className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('true-false')} className="h-8 w-8 p-0" title="True/False">
            <ToggleLeft className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAddElement('fill-in-blank')} className="h-8 w-8 p-0" title="Fill in Blank">
            <FileText className="w-3 h-3" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Arrangement Tools */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <LayoutDashboard className="w-3 h-3 mr-1" />
              Arrange
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Auto Arrange</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAutoArrange?.('grid')}>
              <Grid className="w-4 h-4 mr-2" />
              Grid Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoArrange?.('center')}>
              <AlignCenter className="w-4 h-4 mr-2" />
              Center Elements
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoArrange?.('justify')}>
              <AlignJustify className="w-4 h-4 mr-2" />
              Auto Fit to Box
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoArrange?.('stack')}>
              <Maximize2 className="w-4 h-4 mr-2" />
              Scale to Fit Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Formatting Tools */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Format
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Formatting</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAutoArrange?.('align-left')}>
              <AlignLeft className="w-4 h-4 mr-2" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoArrange?.('align-center')}>
              <AlignCenter className="w-4 h-4 mr-2" />
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoArrange?.('align-right')}>
              <AlignRight className="w-4 h-4 mr-2" />
              Align Right
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Tools */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>AI Tools</DropdownMenuLabel>
            <DropdownMenuItem>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileQuestion className="w-4 h-4 mr-2" />
              Generate Questions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Summarize
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border" />

        {/* Card Type */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
              {currentCard.card_type || 'Standard'}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Card Type</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'standard' })}>
              Standard Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'informational' })}>
              Informational Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'single-sided' })}>
              Single-Sided Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Side Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSideChange(currentSide === 'front' ? 'back' : 'front')}
          disabled={isBackSideDisabled}
          className="h-8 px-2 text-xs"
        >
          {currentSide === 'front' ? 'Back' : 'Front'}
        </Button>

        <div className="w-px h-6 bg-border" />

        {/* Navigation */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateCard('prev')}
            disabled={currentCardIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs px-2 text-muted-foreground min-w-[60px] text-center">
            {currentCardIndex + 1}/{totalCards}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" onClick={onCreateNewCard} className="h-8 w-8 p-0" title="New Card">
            <Plus className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onSave} className="h-8 w-8 p-0" title="Save">
            <Save className="w-3 h-3" />
          </Button>
          <Button variant="destructive" size="sm" onClick={async () => {
            const confirmDelete = window.confirm("Are you sure you want to delete this card?");
            if (confirmDelete) {
              const success = await onDeleteCard();
              if (!success) {
                alert("Cannot delete the last card in the set.");
              }
            }
          }} className="h-8 w-8 p-0" title="Delete Card">
            <Trash className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
