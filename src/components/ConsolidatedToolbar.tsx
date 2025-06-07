
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Type, Image, Volume2, Palette, Video, 
  ChevronLeft, ChevronRight, RotateCcw,
  Plus, Copy, Trash2, Grid3X3, AlignCenter, AlignJustify, 
  AlignLeft, AlignRight, Layers, FlipHorizontal, FlipVertical,
  CheckSquare, HelpCircle, Shuffle, List, Grid, Eye
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { CardSideToggle } from './CardSideToggle';
import { CardTypeSelector } from './CardTypeSelector';
import { TemplateSelector } from './TemplateSelector';

interface ConsolidatedToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  currentCard: Flashcard;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => void;
  onShowCardOverview?: () => void;
  position?: 'left' | 'right';
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
  onCreateNewCardFromTemplate,
  onDeleteCard,
  onCardTypeChange,
  onShowCardOverview,
  position = 'left'
}) => {
  const { t } = useI18n();
  const [showTemplates, setShowTemplates] = useState(false);

  const ToolbarButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    variant = "ghost",
    disabled = false 
  }: { 
    icon: any; 
    label: string; 
    onClick: () => void; 
    variant?: "ghost" | "default"; 
    disabled?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onClick}
            disabled={disabled}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={position === 'left' ? 'right' : 'left'}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="bg-background border rounded-lg shadow-sm p-2 w-12 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex flex-col items-center space-y-1">
        {/* Navigation */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          onClick={() => onNavigateCard('prev')}
          disabled={currentCardIndex === 0}
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex >= totalCards - 1}
          title="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="text-[10px] text-muted-foreground text-center leading-tight">
          {currentCardIndex + 1}<br/>{totalCards}
        </div>

        <div className="w-6 h-px bg-border my-1" />

        {/* Card Management */}
        <ToolbarButton
          icon={Plus}
          label={t('newCard') || 'New Card'}
          onClick={onCreateNewCard}
        />
        
        <ToolbarButton
          icon={Copy}
          label={t('copyLayout') || 'Copy Layout'}
          onClick={onCreateNewCardWithLayout}
        />
        
        <ToolbarButton
          icon={Trash2}
          label={t('deleteCard') || 'Delete Card'}
          onClick={onDeleteCard}
          disabled={totalCards <= 1}
        />

        <div className="w-6 h-px bg-border my-1" />

        {/* Front/Back Toggle */}
        <Button
          variant={currentSide === 'front' ? 'default' : 'ghost'}
          size="sm"
          className="w-8 h-8 p-0 text-[10px]"
          onClick={() => onSideChange('front')}
          title="Front Side"
        >
          F
        </Button>
        
        <Button
          variant={currentSide === 'back' ? 'default' : 'ghost'}
          size="sm"
          className="w-8 h-8 p-0 text-[10px]"
          onClick={() => onSideChange('back')}
          disabled={currentCard?.card_type === 'single-sided'}
          title="Back Side"
        >
          B
        </Button>

        <div className="w-6 h-px bg-border my-1" />

        {/* Elements */}
        <ToolbarButton
          icon={Type}
          label={t('text') || 'Text'}
          onClick={() => onAddElement('text')}
        />
        
        <ToolbarButton
          icon={Image}
          label={t('image') || 'Image'}
          onClick={() => onAddElement('image')}
        />
        
        <ToolbarButton
          icon={Volume2}
          label={t('audio') || 'Audio'}
          onClick={() => onAddElement('audio')}
        />
        
        <ToolbarButton
          icon={Video}
          label={t('youtube') || 'YouTube'}
          onClick={() => onAddElement('youtube')}
        />
        
        <ToolbarButton
          icon={Palette}
          label={t('drawing') || 'Drawing'}
          onClick={() => onAddElement('drawing')}
        />

        <div className="w-6 h-px bg-border my-1" />

        {/* Interactive Elements */}
        <ToolbarButton
          icon={CheckSquare}
          label={t('multipleChoice') || 'Multiple Choice'}
          onClick={() => onAddElement('multiple-choice')}
        />
        
        <ToolbarButton
          icon={HelpCircle}
          label={t('trueFalse') || 'True/False'}
          onClick={() => onAddElement('true-false')}
        />

        <div className="w-6 h-px bg-border my-1" />

        {/* Auto Arrange */}
        <ToolbarButton
          icon={Grid3X3}
          label={t('grid') || 'Grid'}
          onClick={() => onAutoArrange('grid')}
        />
        
        <ToolbarButton
          icon={AlignCenter}
          label={t('center') || 'Center'}
          onClick={() => onAutoArrange('center')}
        />
        
        <ToolbarButton
          icon={Layers}
          label={t('stack') || 'Stack'}
          onClick={() => onAutoArrange('stack')}
        />

        {onShowCardOverview && (
          <>
            <div className="w-6 h-px bg-border my-1" />
            <ToolbarButton
              icon={Grid}
              label="Card Overview"
              onClick={onShowCardOverview}
            />
          </>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <TemplateSelector
          onSelectTemplate={onCreateNewCardFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};
