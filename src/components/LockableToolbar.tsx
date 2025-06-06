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
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  LayoutDashboard,
  ListOrdered,
  ListUnordered,
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
} from "lucide-react";
import { Flashcard, CanvasElement } from '@/types/flashcard';

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
  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-background/90 backdrop-blur-sm z-40 border-b border-border">
      <div className="container max-w-5xl h-full flex items-center justify-between">
        {/* Left Side - Set Info and Navigation */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{set.title}</h1>
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        </div>

        {/* Center - Card Editing Options */}
        <div className="flex items-center gap-2">
          {/* Add Element Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add Element
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Add to Card</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddElement('text')}>
                <Text className="w-4 h-4 mr-2" />
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('image')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('drawing')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Drawing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('multiple-choice')}>
                <ListOrdered className="w-4 h-4 mr-2" />
                Multiple Choice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('true-false')}>
                <ListUnordered className="w-4 h-4 mr-2" />
                True / False
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddElement('youtube')}>
                <ImageIcon className="w-4 h-4 mr-2" />
                YouTube Embed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddElement('deck-embed')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Deck Embed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto Arrange Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Grid className="w-4 h-4" />
                Auto Arrange
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Layout</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAutoArrange?.('grid')}>
                <Grid className="w-4 h-4 mr-2" />
                Grid Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange?.('center')}>
                <AlignCenter className="w-4 h-4 mr-2" />
                Center All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange?.('justify')}>
                <AlignJustify className="w-4 h-4 mr-2" />
                Justify Horizontally
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange?.('stack')}>
                <Layers className="w-4 h-4 mr-2" />
                Stack Vertically
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Text Alignment</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAutoArrange?.('align-left')}>
                <AlignLeft className="w-4 h-4 mr-2" />
                Align Text Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange?.('align-center')}>
                <AlignCenter className="w-4 h-4 mr-2" />
                Align Text Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAutoArrange?.('align-right')}>
                <AlignRight className="w-4 h-4 mr-2" />
                Align Text Right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Card Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Card Type: {currentCard.card_type || 'Standard'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Card Type</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'standard' })}>
                Standard Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'informational' })}>
                Informational Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateCard(currentCard.id, { card_type: 'single-sided' })}>
                Single-Sided Card
              </DropdownMenuItem>
              {/* Add more card types here as needed */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Side Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSideChange(currentSide === 'front' ? 'back' : 'front')}
            disabled={isBackSideDisabled}
          >
            Show {currentSide === 'front' ? 'Back' : 'Front'}
          </Button>
        </div>

        {/* Right Side - Card Management and Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateCard('prev')}
            disabled={currentCardIndex === 0}
          >
            <ArrowLeft className="w-4 h-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onCreateNewCard}>
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
          <Button variant="ghost" size="sm" onClick={onCreateNewCardWithLayout}>
            <Copy className="w-4 h-4 mr-2" />
            Clone Card
          </Button>
          <Button variant="ghost" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="destructive" size="sm" onClick={async () => {
            const confirmDelete = window.confirm("Are you sure you want to delete this card?");
            if (confirmDelete) {
              const success = await onDeleteCard();
              if (!success) {
                alert("Cannot delete the last card in the set.");
              }
            }
          }}>
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
