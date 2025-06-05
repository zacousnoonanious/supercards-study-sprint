
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Image, 
  Volume2, 
  Pencil, 
  CheckSquare, 
  ToggleLeft,
  Youtube,
  Layers,
  Plus,
  Copy,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { CardTypeSelector } from './CardTypeSelector';
import { Flashcard } from '@/types/flashcard';

interface CanvasOverlayToolbarProps {
  set: any;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onAddElement: (type: string) => void;
  onUpdateCard: (id: string, updates: Partial<Flashcard>) => void;
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
  const elementTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'audio', icon: Volume2, label: 'Audio' },
    { type: 'drawing', icon: Pencil, label: 'Drawing' },
    { type: 'multiple-choice', icon: CheckSquare, label: 'MC' },
    { type: 'true-false', icon: ToggleLeft, label: 'T/F' },
    { type: 'fill-in-blank', icon: FileText, label: 'Fill' },
    { type: 'youtube', icon: Youtube, label: 'Video' },
    { type: 'deck-embed', icon: Layers, label: 'Embed' },
  ];

  return (
    <div className="absolute top-2 left-2 right-2 z-40 pointer-events-none">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-sm pointer-events-auto">
        <CardContent className="p-2">
          <div className="flex items-center justify-between gap-3">
            {/* Left section - Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateCard('prev')}
                disabled={currentCardIndex === 0}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                {currentCardIndex + 1}/{totalCards}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateCard('next')}
                disabled={currentCardIndex === totalCards - 1}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>

              {/* Side toggle */}
              <div className="flex bg-gray-100 rounded p-0.5">
                <Button
                  variant={currentSide === 'front' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onSideChange('front')}
                  className="h-6 px-2 text-xs"
                >
                  Front
                </Button>
                <Button
                  variant={currentSide === 'back' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onSideChange('back')}
                  className="h-6 px-2 text-xs"
                >
                  Back
                </Button>
              </div>
            </div>

            {/* Center section - Add elements */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 mr-1">Add:</span>
              {elementTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddElement(type)}
                  className="h-7 w-7 p-0"
                  title={`Add ${label}`}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              ))}
            </div>

            {/* Right section - Card actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNewCard}
                className="h-7 px-2 text-xs"
                title="New Card"
              >
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNewCardWithLayout}
                className="h-7 px-2 text-xs"
                title="Duplicate Layout"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteCard}
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                title="Delete Card"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <CardTypeSelector
                card={currentCard}
                onUpdateCard={(updates) => onUpdateCard(currentCard.id, updates)}
              />
              
              <Button onClick={onSave} size="sm" className="h-7 px-3 text-xs">
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
