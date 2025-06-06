
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
    <div className="fixed top-0 left-0 w-full h-20 bg-background/90 backdrop-blur-sm z-40 border-b border-border">
      <div className="container max-w-full h-full flex items-center justify-between px-4">
        {/* Left Side - Navigation and Set Info */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/decks')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Decks
          </Button>
          <div className="text-sm text-muted-foreground">
            {set.title} • Card {currentCardIndex + 1} of {totalCards}
          </div>
        </div>

        {/* Center - Add Element Tools (Individual Icons) */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('text')}
            className="h-8 w-8 p-0"
            title="Add Text"
          >
            <Text className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('image')}
            className="h-8 w-8 p-0"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('audio')}
            className="h-8 w-8 p-0"
            title="Add Audio"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('drawing')}
            className="h-8 w-8 p-0"
            title="Add Drawing"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('youtube')}
            className="h-8 w-8 p-0"
            title="Add YouTube Video"
          >
            <Youtube className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('deck-embed')}
            className="h-8 w-8 p-0"
            title="Embed Deck"
          >
            <Layers className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('multiple-choice')}
            className="h-8 w-8 p-0"
            title="Multiple Choice"
          >
            <CheckSquare className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('true-false')}
            className="h-8 w-8 p-0"
            title="True/False"
          >
            <ToggleLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddElement('fill-in-blank')}
            className="h-8 w-8 p-0"
            title="Fill in Blank"
          >
            <FileText className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

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
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-1" />
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
            <Trash className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
