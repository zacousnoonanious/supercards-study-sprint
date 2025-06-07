
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

  const ToolbarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

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
    <div className={`bg-background border rounded-lg shadow-sm p-3 w-16 max-h-[calc(100vh-120px)] overflow-y-auto ${
      position === 'left' ? 'mr-0' : 'ml-0'
    }`}>
      <div className="space-y-4">
        {/* Navigation Section */}
        <ToolbarSection title={t('navigation') || 'Navigation'}>
          <div className="flex flex-col gap-1">
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
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {currentCardIndex + 1}/{totalCards}
          </div>
          
          {onShowCardOverview && (
            <ToolbarButton
              icon={Grid}
              label="Card Overview"
              onClick={onShowCardOverview}
            />
          )}
        </ToolbarSection>

        <Separator />

        {/* Card Management */}
        <ToolbarSection title={t('cards') || 'Cards'}>
          <div className="flex flex-col gap-1">
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
              icon={Shuffle}
              label={t('templates') || 'Templates'}
              onClick={() => setShowTemplates(true)}
            />
            <ToolbarButton
              icon={Trash2}
              label={t('deleteCard') || 'Delete Card'}
              onClick={onDeleteCard}
              disabled={totalCards <= 1}
            />
          </div>
        </ToolbarSection>

        <Separator />

        {/* Card Side Toggle */}
        <ToolbarSection title={t('side') || 'Side'}>
          <CardSideToggle
            currentSide={currentSide}
            onSideChange={onSideChange}
            isBackDisabled={currentCard?.card_type === 'single-sided'}
          />
        </ToolbarSection>

        <Separator />

        {/* Elements Section */}
        <ToolbarSection title={t('elements') || 'Elements'}>
          <div className="flex flex-col gap-1">
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
          </div>
        </ToolbarSection>

        <Separator />

        {/* Interactive Elements */}
        <ToolbarSection title={t('interactive') || 'Interactive'}>
          <div className="flex flex-col gap-1">
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
          </div>
        </ToolbarSection>

        <Separator />

        {/* Auto Arrange */}
        <ToolbarSection title={t('arrange') || 'Arrange'}>
          <div className="flex flex-col gap-1">
            <ToolbarButton
              icon={Grid3X3}
              label={t('grid') || 'Grid'}}
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
            <ToolbarButton
              icon={AlignJustify}
              label={t('justify') || 'Justify'}
              onClick={() => onAutoArrange('justify')}
            />
          </div>
        </ToolbarSection>

        <Separator />

        {/* Card Type */}
        <ToolbarSection title={t('cardType') || 'Card Type'}>
          <CardTypeSelector
            card={currentCard}
            onUpdateCard={(updates) => {
              if (updates.card_type && updates.card_type !== currentCard.card_type) {
                onCardTypeChange(updates.card_type);
              }
            }}
          />
        </ToolbarSection>
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
