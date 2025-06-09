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
  Menu, Move, Pin, PinOff
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
  className
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [showTemplates, setShowTemplates] = useState(false);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);
  const isHorizontal = position === 'very-top';
  const isFloating = position === 'floating';

  // Force icon mode for horizontal layout
  const displayText = !isHorizontal && !isFloating && showText;

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
            size="sm"
            className={displayText ? "w-auto h-8 px-2" : "w-8 h-8 p-0 shrink-0"}
            onClick={onClick}
            disabled={disabled}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {displayText && <span className="ml-1 text-xs whitespace-nowrap">{label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={position === 'left' || position === 'canvas-left' ? 'right' : 'bottom'}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const getContainerClass = () => {
    const baseClass = `border rounded-lg shadow-sm p-2 ${
      isDarkTheme
        ? 'bg-gray-800 border-gray-600 text-white' 
        : 'bg-background border text-foreground'
    } ${className || ''}`;

    if (isFloating) {
      return `${baseClass} grid grid-cols-2 gap-1 w-28 max-h-[calc(100vh-120px)] overflow-y-auto`;
    }

    if (isHorizontal) {
      return `${baseClass} flex flex-row items-center gap-2 w-auto max-w-full overflow-x-auto`;
    }

    return `${baseClass} flex flex-col items-center space-y-1 ${displayText ? 'w-36' : 'w-16'} max-h-[calc(100vh-120px)] overflow-y-auto`;
  };

  const getPositioning = () => {
    if (!isDocked || isFloating) return {};
    
    switch (position) {
      case 'left':
        return {
          position: 'fixed' as const,
          left: '8px',
          top: '100px',
          zIndex: 50
        };
      case 'very-top':
        return {
          position: 'fixed' as const,
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60
        };
      case 'canvas-left':
        // This will be positioned by the parent container in CardEditor
        return {};
      default:
        return {};
    }
  };

  const getSeparator = () => {
    if (isFloating) {
      return <div className="col-span-2 h-px bg-border my-1" />;
    }
    if (isHorizontal) {
      return <Separator orientation="vertical" className="h-6" />;
    }
    return <div className={`w-6 h-px my-1 ${isDarkTheme ? 'bg-gray-600' : 'bg-border'}`} />;
  };

  const getButtonGroupClass = () => {
    if (isFloating) {
      return "contents"; // Use CSS Grid contents to place buttons in grid
    }
    if (isHorizontal) {
      return "flex items-center gap-1";
    }
    return "flex flex-col items-center space-y-1";
  };

  return (
    <div className={getContainerClass()} style={{ ...style, ...getPositioning() }}>
      {/* Dock/Undock and Text/Icon Toggle */}
      <div className={getButtonGroupClass()}>
        {onToggleDock && (
          <Button
            variant="ghost"
            size="sm"
            className={displayText ? "w-auto h-6 px-2" : "w-6 h-6 p-0 shrink-0"}
            onClick={onToggleDock}
            title={isDocked ? "Undock" : "Dock"}
          >
            {isDocked ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            {displayText && <span className="ml-1 text-[10px] whitespace-nowrap">Dock</span>}
          </Button>
        )}
        
        {!isHorizontal && !isFloating && (
          <Button
            variant="ghost"
            size="sm"
            className={displayText ? "w-auto h-6 px-2" : "w-6 h-6 p-0 shrink-0"}
            onClick={handleTextToggle}
            title={showText ? "Show Icons" : "Show Text"}
          >
            <Menu className="w-3 h-3" />
            {displayText && <span className="ml-1 text-[10px] whitespace-nowrap">{showText ? "Icons" : "Text"}</span>}
          </Button>
        )}
      </div>

      {getSeparator()}

      {/* Navigation */}
      <div className={getButtonGroupClass()}>
        <Button
          variant="ghost"
          size="sm"
          className={displayText ? "w-auto h-8 px-2" : "w-8 h-8 p-0 shrink-0"}
          onClick={() => onNavigateCard('prev')}
          disabled={currentCardIndex === 0}
          title="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
          {displayText && <span className="ml-1 text-xs whitespace-nowrap">Prev</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={displayText ? "w-auto h-8 px-2" : "w-8 h-8 p-0 shrink-0"}
          onClick={() => onNavigateCard('next')}
          disabled={currentCardIndex >= totalCards - 1}
          title="Next"
        >
          <ChevronRight className="w-4 h-4" />
          {displayText && <span className="ml-1 text-xs whitespace-nowrap">Next</span>}
        </Button>

        <div className={`text-[10px] text-center leading-tight ${
          isDarkTheme ? 'text-gray-300' : 'text-muted-foreground'
        } ${displayText ? 'px-2' : ''} ${isFloating ? 'col-span-2' : ''}`}>
          {currentCardIndex + 1}<br/>{totalCards}
        </div>
      </div>

      {getSeparator()}

      {/* Card Management */}
      <div className={getButtonGroupClass()}>
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
      <div className={getButtonGroupClass()}>
        <Button
          variant={currentSide === 'front' ? 'default' : 'ghost'}
          size="sm"
          className={displayText ? "w-auto h-8 px-2 text-[10px]" : "w-8 h-8 p-0 text-[10px] shrink-0"}
          onClick={() => onSideChange('front')}
          title="Front Side"
        >
          F{displayText && <span className="ml-1 whitespace-nowrap">ront</span>}
        </Button>
        
        <Button
          variant={currentSide === 'back' ? 'default' : 'ghost'}
          size="sm"
          className={displayText ? "w-auto h-8 px-2 text-[10px]" : "w-8 h-8 p-0 text-[10px] shrink-0"}
          onClick={() => onSideChange('back')}
          disabled={currentCard?.card_type === 'single-sided'}
          title="Back Side"
        >
          B{displayText && <span className="ml-1 whitespace-nowrap">ack</span>}
        </Button>
      </div>

      {getSeparator()}

      {/* Elements */}
      <div className={getButtonGroupClass()}>
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

      {getSeparator()}

      {/* Interactive Elements */}
      <div className={getButtonGroupClass()}>
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
      <div className={getButtonGroupClass()}>
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
