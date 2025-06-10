
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Type, Image, Volume2, Palette, Video, 
  ChevronLeft, ChevronRight, RotateCcw,
  Plus, Copy, Trash2, Grid3X3, AlignCenter, AlignJustify, 
  AlignLeft, AlignRight, Layers, FlipHorizontal, FlipVertical,
  CheckSquare, HelpCircle, Shuffle, List, Grid, Eye, FileText,
  Menu, Move, Pin, PinOff, Mic
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
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
  position?: 'left' | 'very-top' | 'canvas-left' | 'floating';
  isDocked?: boolean;
  onToggleDock?: () => void;
  showText?: boolean;
  onTextToggle?: (showText: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  canvasRef?: React.RefObject<HTMLDivElement>;
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
  position = 'left',
  isDocked = true,
  onToggleDock,
  showText = false,
  onTextToggle,
  style,
  className,
  canvasRef
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [showTemplates, setShowTemplates] = useState(false);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);
  
  // Use the actual showText prop instead of always false
  const displayText = showText;

  const handleTextToggle = () => {
    const newShowText = !showText;
    onTextToggle?.(newShowText);
  };

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
            size={displayText ? "sm" : "sm"}
            className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 shrink-0"}
            onClick={onClick}
            disabled={disabled}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {displayText && <span className="text-xs truncate">{label}</span>}
          </Button>
        </TooltipTrigger>
        {!displayText && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  const getSeparator = () => {
    return <div className={displayText ? "w-full h-px my-2 bg-border" : "w-6 h-px my-1 bg-border"} />;
  };

  return (
    <div 
      className={displayText ? "p-2 flex flex-col space-y-1 overflow-y-auto h-full min-w-[160px]" : "p-2 flex flex-col items-center space-y-1 overflow-y-auto h-full"} 
      style={style}
    >
      {/* Text/Icon Toggle */}
      {onTextToggle && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className={displayText ? "w-full justify-start gap-2 h-8" : "w-6 h-6 p-0 shrink-0"}
            onClick={handleTextToggle}
            title={showText ? "Show Icons" : "Show Text"}
          >
            <Menu className="w-3 h-3" />
            {displayText && <span className="text-xs">Toggle View</span>}
          </Button>
          
          {getSeparator()}
        </>
      )}

      {/* Navigation */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <Button
          variant="ghost"
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 shrink-0"}
          onClick={() => onNavigateCard('prev')}
          disabled={currentCardIndex === 0}
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
          {displayText && <span className="text-xs">Previous</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 shrink-0"}
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex >= totalCards - 1}
          title="Next"
        >
          <ChevronRight className="w-4 h-4" />
          {displayText && <span className="text-xs">Next</span>}
        </Button>

        {!displayText && (
          <div className="text-[10px] text-center leading-tight text-muted-foreground">
            {currentCardIndex + 1}<br/>{totalCards}
          </div>
        )}
        
        {displayText && (
          <div className="text-xs text-center text-muted-foreground px-2">
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        )}
      </div>

      {getSeparator()}

      {/* Card Management */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
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
      </div>

      {getSeparator()}

      {/* Front/Back Toggle */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <Button
          variant={currentSide === 'front' ? 'default' : 'ghost'}
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 text-[10px] shrink-0"}
          onClick={() => onSideChange('front')}
          title="Front Side"
        >
          {displayText ? <span className="text-xs">Front Side</span> : 'F'}
        </Button>
        
        <Button
          variant={currentSide === 'back' ? 'default' : 'ghost'}
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 text-[10px] shrink-0"}
          onClick={() => onSideChange('back')}
          disabled={currentCard?.card_type === 'single-sided'}
          title="Back Side"
        >
          {displayText ? <span className="text-xs">Back Side</span> : 'B'}
        </Button>
      </div>

      {getSeparator()}

      {/* Elements */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <ToolbarButton
          icon={Type}
          label={t('text') || 'Text'}
          onClick={() => onAddElement('text')}
        />
        
        <ToolbarButton
          icon={Mic}
          label={t('tts') || 'Text-to-Speech'}
          onClick={() => onAddElement('tts')}
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

      {getSeparator()}

      {/* Interactive Elements */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
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

        <ToolbarButton
          icon={FileText}
          label={t('fillInBlank') || 'Fill in the Blank'}
          onClick={() => onAddElement('fill-in-blank')}
        />
      </div>

      {getSeparator()}

      {/* Auto Arrange */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
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
          <ToolbarButton
            icon={Grid}
            label="Card Overview"
            onClick={onShowCardOverview}
          />
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
