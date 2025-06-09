
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { FlashcardSet, Flashcard, CanvasElement } from '@/types/flashcard';
import { 
  Type, Image, Video, Music, Square, CheckSquare, 
  Circle, PenTool, Youtube, BookOpen, Save, Plus,
  ArrowLeft, ArrowRight, Grid, Eye, EyeOff, Settings
} from 'lucide-react';

interface LockableToolbarProps {
  set?: FlashcardSet;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onAddElement: (type: CanvasElement['type']) => void;
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onDeleteCard: () => void;
  onSave: () => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'scale-to-fit') => void;
  isBackSideDisabled?: boolean;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  cardDimensions?: { width: number; height: number };
  onCardDimensionsChange?: (width: number, height: number) => void;
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
  showGrid = true,
  onToggleGrid,
  cardDimensions = { width: 600, height: 400 },
  onCardDimensionsChange,
}) => {
  const { theme } = useTheme();
  const [showDimensionsEdit, setShowDimensionsEdit] = useState(false);
  const [tempDimensions, setTempDimensions] = useState(cardDimensions);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleDimensionsSubmit = () => {
    onCardDimensionsChange?.(tempDimensions.width, tempDimensions.height);
    setShowDimensionsEdit(false);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 border-b z-40 p-2 ${
      isDarkTheme
        ? 'bg-gray-800 border-gray-600 text-white' 
        : 'bg-background border text-foreground'
    }`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigateCard('prev')}
            disabled={currentCardIndex === 0}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentCardIndex + 1} / {totalCards}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Side Toggle */}
        <div className="flex items-center gap-1">
          <Button
            variant={currentSide === 'front' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange('front')}
          >
            Front
          </Button>
          <Button
            variant={currentSide === 'back' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange('back')}
            disabled={isBackSideDisabled}
          >
            Back
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Add Elements */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onAddElement('text')}>
            <Type className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('image')}>
            <Image className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('audio')}>
            <Music className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('youtube')}>
            <Youtube className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('multiple-choice')}>
            <CheckSquare className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('true-false')}>
            <Circle className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('fill-in-blank')}>
            <Square className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('drawing')}>
            <PenTool className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('deck-embed')}>
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Arrange */}
        <Select onValueChange={(value) => onAutoArrange(value as any)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Arrange" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="justify">Justify</SelectItem>
            <SelectItem value="stack">Stack</SelectItem>
            <SelectItem value="align-left">Align Left</SelectItem>
            <SelectItem value="align-center">Align Center</SelectItem>
            <SelectItem value="align-right">Align Right</SelectItem>
            <SelectItem value="scale-to-fit">Scale to Fit</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Grid Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleGrid}
        >
          {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Grid
        </Button>

        {/* Card Dimensions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDimensionsEdit(!showDimensionsEdit)}
        >
          <Settings className="w-4 h-4" />
          {cardDimensions.width}×{cardDimensions.height}
        </Button>

        {showDimensionsEdit && (
          <div className="flex items-center gap-2 bg-background border rounded p-2">
            <Label className="text-xs">W:</Label>
            <Input
              type="number"
              value={tempDimensions.width}
              onChange={(e) => setTempDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 600 }))}
              className="w-16 h-6 text-xs"
            />
            <Label className="text-xs">H:</Label>
            <Input
              type="number"
              value={tempDimensions.height}
              onChange={(e) => setTempDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 400 }))}
              className="w-16 h-6 text-xs"
            />
            <Button size="sm" onClick={handleDimensionsSubmit}>Apply</Button>
          </div>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onCreateNewCard}>
            <Plus className="w-4 h-4" />
            Card
          </Button>
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
