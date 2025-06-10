
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, 
  Image, 
  Volume2, 
  Pencil, 
  CheckSquare, 
  ToggleLeft,
  Youtube,
  Layers,
  FileText,
  Grid3x3,
  AlignCenter,
  AlignJustify,
  Layers3,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  SquareStack,
  Plus,
  Copy,
  Trash2,
  LayoutGrid,
  AlignLeft,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTemplateConfiguration } from '@/hooks/useTemplateConfiguration';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { EnhancedAddCardButton } from './EnhancedAddCardButton';

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
  position: 'left' | 'very-top' | 'canvas-left' | 'floating';
  isDocked: boolean;
  showText: boolean;
  onTextToggle?: (showText: boolean) => void;
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
  position,
  isDocked,
  showText,
  onTextToggle,
  canvasRef,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { getCardTemplateSettings, isElementTypeAllowed } = useTemplateConfiguration();
  
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);
  
  // Get template settings for current card
  const templateSettings = getCardTemplateSettings(currentCard);

  const elementTypes = [
    { type: 'text', icon: Type, label: t('toolbar.addText'), key: 't' },
    { type: 'image', icon: Image, label: t('toolbar.addImage'), key: 'i' },
    { type: 'audio', icon: Volume2, label: t('toolbar.addAudio'), key: 'a' },
    { type: 'youtube', icon: Youtube, label: t('toolbar.addYoutube'), key: 'y' },
    { type: 'multiple-choice', icon: CheckSquare, label: t('toolbar.addMultipleChoice'), key: 'm' },
    { type: 'true-false', icon: ToggleLeft, label: t('toolbar.addTrueFalse'), key: 'f' },
    { type: 'fill-in-blank', icon: FileText, label: t('toolbar.addFillInBlank'), key: 'b' },
    { type: 'drawing', icon: Pencil, label: t('toolbar.addDrawing'), key: 'd' },
    { type: 'deck-embed', icon: Layers, label: t('toolbar.addDeckEmbed'), key: 'e' },
    { type: 'tts', icon: Volume2, label: t('toolbar.addTTS'), key: 's' },
  ];

  // Filter element types based on template restrictions
  const allowedElementTypes = elementTypes.filter(elementType => 
    isElementTypeAllowed(elementType.type, currentCard)
  );

  const arrangements = [
    { type: 'grid' as const, icon: Grid3x3, label: t('toolbar.arrangeGrid'), key: 'g' },
    { type: 'center' as const, icon: AlignCenter, label: t('toolbar.arrangeCenter'), key: 'c' },
    { type: 'justify' as const, icon: AlignJustify, label: t('toolbar.arrangeJustify'), key: 'j' },
    { type: 'stack' as const, icon: Layers3, label: t('toolbar.arrangeStack'), key: 's' },
    { type: 'align-left' as const, icon: AlignLeftIcon, label: t('toolbar.arrangeAlignLeft'), key: '1' },
    { type: 'align-center' as const, icon: AlignCenterIcon, label: t('toolbar.arrangeAlignCenter'), key: '2' },
    { type: 'align-right' as const, icon: AlignRight, label: t('toolbar.arrangeAlignRight'), key: '3' },
  ];

  const renderIcon = (icon: React.ComponentType<any>, text?: string) => {
    return (
      <div className="flex flex-col items-center justify-center">
        {React.createElement(icon, { className: "w-5 h-5" })}
        {text && <span className="text-xs mt-1">{text}</span>}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full border-r bg-background transition-all duration-200 ${
      showText ? 'w-48' : 'w-20'
    }`}>
      {/* Header with text toggle */}
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${showText ? 'block' : 'hidden'}`}>
            {t('toolbar.tools')}
          </span>
          {onTextToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextToggle(!showText)}
              className="p-1"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Card Navigation */}
          <div className="space-y-1">
            {showText && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Navigation
              </h3>
            )}
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateCard('prev')}
                disabled={currentCardIndex === 0}
                className={`flex-1 ${!showText ? 'aspect-square p-0' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
                {showText && <span className="ml-1">Prev</span>}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateCard('next')}
                disabled={currentCardIndex >= totalCards - 1}
                className={`flex-1 ${!showText ? 'aspect-square p-0' : ''}`}
              >
                <ChevronRight className="w-4 h-4" />
                {showText && <span className="ml-1">Next</span>}
              </Button>
            </div>

            {showText && (
              <div className="text-xs text-center text-muted-foreground mt-1">
                {currentCardIndex + 1} of {totalCards}
              </div>
            )}
          </div>

          {/* Card Side Toggle - Only show if template allows back side */}
          {templateSettings.showBackSide && (
            <div className="space-y-1">
              {showText && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Card Side
                </h3>
              )}
              
              <div className="flex gap-1">
                <Button
                  variant={currentSide === 'front' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSideChange('front')}
                  className={`flex-1 ${!showText ? 'aspect-square p-0' : ''}`}
                >
                  <SquareStack className="w-4 h-4" />
                  {showText && <span className="ml-1">Front</span>}
                </Button>
                
                <Button
                  variant={currentSide === 'back' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSideChange('back')}
                  className={`flex-1 ${!showText ? 'aspect-square p-0' : ''}`}
                >
                  <SquareStack className="w-4 h-4" />
                  {showText && <span className="ml-1">Back</span>}
                </Button>
              </div>
            </div>
          )}

          {/* Add Elements - Only show allowed types and if toolbar not restricted */}
          {!templateSettings.restrictedToolbar && allowedElementTypes.length > 0 && (
            <div className="space-y-1">
              {showText && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Add Elements
                </h3>
              )}
              
              <div className="grid gap-1">
                {allowedElementTypes.map(({ type, icon: Icon, label, key }) => (
                  <TooltipProvider key={type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddElement(type)}
                          className={`${showText ? 'justify-start' : 'aspect-square p-0'} transition-colors`}
                        >
                          <Icon className="w-4 h-4" />
                          {showText && <span className="ml-2">{label}</span>}
                        </Button>
                      </TooltipTrigger>
                      {!showText && (
                        <TooltipContent side="right">
                          <div className="flex items-center gap-2">
                            <span>{label}</span>
                            {key && (
                              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                                {key.toUpperCase()}
                              </kbd>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Template info for restricted cards */}
          {templateSettings.restrictedToolbar && showText && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                This template has restricted editing to maintain its purpose.
              </div>
            </div>
          )}

          {/* Arrange Elements - Only if toolbar not restricted */}
          {!templateSettings.restrictedToolbar && (
            <div className="space-y-1">
              {showText && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Arrange
                </h3>
              )}
              
              <div className="grid gap-1">
                {arrangements.map(({ type, icon: Icon, label, key }) => (
                  <TooltipProvider key={type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAutoArrange(type)}
                          className={`${showText ? 'justify-start' : 'aspect-square p-0'} transition-colors`}
                        >
                          <Icon className="w-4 h-4" />
                          {showText && <span className="ml-2">{label}</span>}
                        </Button>
                      </TooltipTrigger>
                      {!showText && (
                        <TooltipContent side="right">
                          <div className="flex items-center gap-2">
                            <span>{label}</span>
                            {key && (
                              <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                                {key.toUpperCase()}
                              </kbd>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Card Actions */}
          <div className="space-y-1">
            {showText && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Card Actions
              </h3>
            )}
            
            <div className="grid gap-1">
              {/* Enhanced Add Card Button */}
              <EnhancedAddCardButton
                onCreateCard={onCreateNewCard}
                onCreateFromTemplate={onCreateNewCardFromTemplate}
                showText={showText}
              />
              
              {/* Copy Layout */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCreateNewCardWithLayout}
                      className={`${showText ? 'justify-start' : 'aspect-square p-0'} transition-colors`}
                    >
                      <Copy className="w-4 h-4" />
                      {showText && <span className="ml-2">Copy Layout</span>}
                    </Button>
                  </TooltipTrigger>
                  {!showText && (
                    <TooltipContent side="right">Copy Layout</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Overview */}
              {onShowCardOverview && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowCardOverview}
                        className={`${showText ? 'justify-start' : 'aspect-square p-0'} transition-colors`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        {showText && <span className="ml-2">Overview</span>}
                      </Button>
                    </TooltipTrigger>
                    {!showText && (
                      <TooltipContent side="right">Card Overview</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Delete Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onDeleteCard}
                      className={`${showText ? 'justify-start' : 'aspect-square p-0'} text-destructive hover:text-destructive transition-colors`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {showText && <span className="ml-2">Delete</span>}
                    </Button>
                  </TooltipTrigger>
                  {!showText && (
                    <TooltipContent side="right">Delete Card</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
