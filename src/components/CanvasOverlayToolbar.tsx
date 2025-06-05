
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
  FileText
} from 'lucide-react';
import { CardTypeSelector } from './CardTypeSelector';
import { CardNavigation } from './CardNavigation';
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
    { type: 'multiple-choice', icon: CheckSquare, label: 'Multiple Choice' },
    { type: 'true-false', icon: ToggleLeft, label: 'True/False' },
    { type: 'fill-in-blank', icon: FileText, label: 'Fill in Blank' },
    { type: 'youtube', icon: Youtube, label: 'YouTube' },
    { type: 'deck-embed', icon: Layers, label: 'Embed Deck' },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none">
      <div className="flex flex-col gap-4">
        {/* Top toolbar with navigation and card type */}
        <Card className="bg-white/90 backdrop-blur-sm border shadow-lg pointer-events-auto">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <CardNavigation
                  currentIndex={currentCardIndex}
                  totalCards={totalCards}
                  onNavigate={onNavigateCard}
                  currentSide={currentSide}
                  onSideChange={onSideChange}
                  onCreateNewCard={onCreateNewCard}
                  onCreateNewCardWithLayout={onCreateNewCardWithLayout}
                  onDeleteCard={onDeleteCard}
                  cardType={currentCard?.card_type}
                />
              </div>
              <div className="flex items-center gap-2">
                <CardTypeSelector
                  card={currentCard}
                  onUpdateCard={(updates) => onUpdateCard(currentCard.id, updates)}
                />
                <Button onClick={onSave} size="sm">
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Element toolbar */}
        <Card className="bg-white/90 backdrop-blur-sm border shadow-lg pointer-events-auto">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600 mr-2">Add:</span>
              {elementTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddElement(type)}
                  className="h-8 px-2 text-xs"
                  title={label}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
