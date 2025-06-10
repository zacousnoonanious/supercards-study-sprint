
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
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
  const { t } = useI18n();
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
            title={t('toolbar.previousCard') || 'Previous card'}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {`${currentCardIndex + 1} / ${totalCards}`}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigateCard('next')}
            disabled={currentCardIndex === totalCards - 1}
            title={t('toolbar.nextCard') || 'Next card'}
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
            {t('editor.front') || 'Front'}
          </Button>
          <Button
            variant={currentSide === 'back' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSideChange('back')}
            disabled={isBackSideDisabled}
          >
            {t('editor.back') || 'Back'}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Add Elements */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('text')}
            title={t('toolbar.addText') || 'Add text element'}
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('image')}
            title={t('toolbar.addImage') || 'Add image element'}
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('audio')}
            title={t('toolbar.addAudio') || 'Add audio element'}
          >
            <Music className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('youtube')}
            title={t('toolbar.addYoutube') || 'Add YouTube video'}
          >
            <Youtube className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('multiple-choice')}
            title={t('toolbar.addMultipleChoice') || 'Add multiple choice'}
          >
            <CheckSquare className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('true-false')}
            title={t('toolbar.addTrueFalse') || 'Add true/false'}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('fill-in-blank')}
            title={t('toolbar.addFillInBlank') || 'Add fill in blank'}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('drawing')}
            title={t('toolbar.addDrawing') || 'Add drawing canvas'}
          >
            <PenTool className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddElement('deck-embed')}
            title={t('toolbar.addDeckEmbed') || 'Embed deck'}
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Arrange */}
        <Select onValueChange={(value) => onAutoArrange(value as any)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder={t('toolbar.arrange') || 'Arrange'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">{t('toolbar.arrangeGrid') || 'Grid'}</SelectItem>
            <SelectItem value="center">{t('toolbar.arrangeCenter') || 'Center'}</SelectItem>
            <SelectItem value="justify">{t('toolbar.arrangeJustify') || 'Justify'}</SelectItem>
            <SelectItem value="stack">{t('toolbar.arrangeStack') || 'Stack'}</SelectItem>
            <SelectItem value="align-left">{t('toolbar.arrangeAlignLeft') || 'Align Left'}</SelectItem>
            <SelectItem value="align-center">{t('toolbar.arrangeAlignCenter') || 'Align Center'}</SelectItem>
            <SelectItem value="align-right">{t('toolbar.arrangeAlignRight') || 'Align Right'}</SelectItem>
            <SelectItem value="scale-to-fit">{t('toolbar.arrangeScaleToFit') || 'Scale to Fit'}</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Grid Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleGrid}
          title={showGrid ? (t('toolbar.hideGrid') || 'Hide Grid') : (t('toolbar.showGrid') || 'Show Grid')}
        >
          {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {t('toolbar.grid') || 'Grid'}
        </Button>

        {/* Card Dimensions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDimensionsEdit(!showDimensionsEdit)}
          title={t('toolbar.cardDimensions') || 'Card Dimensions'}
        >
          <Settings className="w-4 h-4" />
          {cardDimensions.width}×{cardDimensions.height}
        </Button>

        {showDimensionsEdit && (
          <div className="flex items-center gap-2 bg-background border rounded p-2">
            <Label className="text-xs">{t('editor.width') || 'W'}:</Label>
            <Input
              type="number"
              value={tempDimensions.width}
              onChange={(e) => setTempDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 600 }))}
              className="w-16 h-6 text-xs"
            />
            <Label className="text-xs">{t('editor.height') || 'H'}:</Label>
            <Input
              type="number"
              value={tempDimensions.height}
              onChange={(e) => setTempDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 400 }))}
              className="w-16 h-6 text-xs"
            />
            <Button size="sm" onClick={handleDimensionsSubmit}>
              {t('common.apply') || 'Apply'}
            </Button>
          </div>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCreateNewCard}
            title={t('toolbar.createNewCard') || 'Create new card'}
          >
            <Plus className="w-4 h-4" />
            {t('toolbar.card') || 'Card'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave}
            title={t('toolbar.save') || 'Save'}
          >
            <Save className="w-4 h-4" />
            {t('common.save') || 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};
