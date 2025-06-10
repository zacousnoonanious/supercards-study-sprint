
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
            title={showText ? t('common.showIcons') || "Show Icons" : t('common.showText') || "Show Text"}
          >
            <Menu className="w-3 h-3" />
            {displayText && <span className="text-xs">{t('common.toggleView') || 'Toggle View'}</span>}
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
          title={t('toolbar.previousCard')}
        >
          <ChevronLeft className="w-4 h-4" />
          {displayText && <span className="text-xs">{t('common.previous')}</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 shrink-0"}
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex >= totalCards - 1}
          title={t('toolbar.nextCard')}
        >
          <ChevronRight className="w-4 h-4" />
          {displayText && <span className="text-xs">{t('common.next')}</span>}
        </Button>

        {!displayText && (
          <div className="text-[10px] text-center leading-tight text-muted-foreground">
            {currentCardIndex + 1}<br/>{totalCards}
          </div>
        )}
        
        {displayText && (
          <div className="text-xs text-center text-muted-foreground px-2">
            {t('toolbar.card')} {currentCardIndex + 1} {t('common.of')} {totalCards}
          </div>
        )}
      </div>

      {getSeparator()}

      {/* Card Management */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <ToolbarButton
          icon={Plus}
          label={t('toolbar.createNewCard')}
          onClick={onCreateNewCard}
        />
        
        <ToolbarButton
          icon={Copy}
          label={t('common.copy') + ' ' + t('common.layout')}
          onClick={onCreateNewCardWithLayout}
        />
        
        <ToolbarButton
          icon={Trash2}
          label={t('common.delete') + ' ' + t('toolbar.card')}
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
          title={t('editor.front')}
        >
          {displayText ? <span className="text-xs">{t('editor.front')}</span> : 'F'}
        </Button>
        
        <Button
          variant={currentSide === 'back' ? 'default' : 'ghost'}
          size="sm"
          className={displayText ? "w-full justify-start gap-2 h-8" : "w-8 h-8 p-0 text-[10px] shrink-0"}
          onClick={() => onSideChange('back')}
          disabled={currentCard?.card_type === 'single-sided'}
          title={t('editor.back')}
        >
          {displayText ? <span className="text-xs">{t('editor.back')}</span> : 'B'}
        </Button>
      </div>

      {getSeparator()}

      {/* Elements */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <ToolbarButton
          icon={Type}
          label={t('toolbar.addText')}
          onClick={() => onAddElement('text')}
        />
        
        <ToolbarButton
          icon={Mic}
          label={t('toolbar.addTTS') || 'Text-to-Speech'}
          onClick={() => onAddElement('tts')}
        />
        
        <ToolbarButton
          icon={Image}
          label={t('toolbar.addImage')}
          onClick={() => onAddElement('image')}
        />
        
        <ToolbarButton
          icon={Volume2}
          label={t('toolbar.addAudio')}
          onClick={() => onAddElement('audio')}
        />
        
        <ToolbarButton
          icon={Video}
          label={t('toolbar.addYoutube')}
          onClick={() => onAddElement('youtube')}
        />
        
        <ToolbarButton
          icon={Palette}
          label={t('toolbar.addDrawing')}
          onClick={() => onAddElement('drawing')}
        />
      </div>

      {getSeparator()}

      {/* Interactive Elements */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <ToolbarButton
          icon={CheckSquare}
          label={t('toolbar.addMultipleChoice')}
          onClick={() => onAddElement('multiple-choice')}
        />
        
        <ToolbarButton
          icon={HelpCircle}
          label={t('toolbar.addTrueFalse')}
          onClick={() => onAddElement('true-false')}
        />

        <ToolbarButton
          icon={FileText}
          label={t('toolbar.addFillInBlank')}
          onClick={() => onAddElement('fill-in-blank')}
        />
      </div>

      {getSeparator()}

      {/* Auto Arrange */}
      <div className={displayText ? "flex flex-col space-y-1 w-full" : "flex flex-col items-center space-y-1"}>
        <ToolbarButton
          icon={Grid3X3}
          label={t('toolbar.arrangeGrid')}
          onClick={() => onAutoArrange('grid')}
        />
        
        <ToolbarButton
          icon={AlignCenter}
          label={t('toolbar.arrangeCenter')}
          onClick={() => onAutoArrange('center')}
        />
        
        <ToolbarButton
          icon={Layers}
          label={t('toolbar.arrangeStack')}
          onClick={() => onAutoArrange('stack')}
        />

        {onShowCardOverview && (
          <ToolbarButton
            icon={Grid}
            label={t('common.cardOverview') || "Card Overview"}
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
