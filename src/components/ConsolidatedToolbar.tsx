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
  Layers3,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight,
  Copy,
  Trash2,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTemplateConfiguration } from '@/hooks/useTemplateConfiguration';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { EnhancedAddCardButton } from './EnhancedAddCardButton';

interface ConsolidatedToolbarProps {
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
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
    { type: 'stack' as const, icon: Layers3, label: t('toolbar.arrangeStack'), key: 's' },
    { type: 'align-left' as const, icon: AlignLeftIcon, label: t('toolbar.arrangeAlignLeft'), key: '1' },
    { type: 'align-center' as const, icon: AlignCenterIcon, label: t('toolbar.arrangeAlignCenter'), key: '2' },
    { type: 'align-right' as const, icon: AlignRight, label: t('toolbar.arrangeAlignRight'), key: '3' },
  ];

  return (
    <div className={`flex flex-col h-full border-r bg-background transition-all duration-200 ${
      showText ? 'w-36' : 'w-10'
    }`}>
      {/* Header with text toggle */}
      <div className="p-1 border-b">
        <div className="flex items-center justify-center">
          {onTextToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTextToggle(!showText)}
              className="p-1 h-6 w-6"
            >
              {showText ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeftOpen className="w-3 h-3" />}
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1 space-y-3">
          {/* Add Card - Top Priority */}
          <div className="space-y-1">
            {showText && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Create
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
                      className={`${showText ? 'justify-start h-6' : 'aspect-square p-0 h-6 w-6'} transition-colors`}
                    >
                      <Copy className="w-2.5 h-2.5" />
                      {showText && <span className="ml-2 text-xs">Copy Layout</span>}
                    </Button>
                  </TooltipTrigger>
                  {!showText && (
                    <TooltipContent side="right">Copy Layout</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Add Elements - Only show allowed types and if toolbar not restricted */}
          {!templateSettings.restrictedToolbar && allowedElementTypes.length > 0 && (
            <div className="space-y-1">
              {showText && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
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
                          className={`${showText ? 'justify-start h-6' : 'aspect-square p-0 h-6 w-6'} transition-colors`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {showText && <span className="ml-2 text-xs">{label}</span>}
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
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
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
                          className={`${showText ? 'justify-start h-6' : 'aspect-square p-0 h-6 w-6'} transition-colors`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {showText && <span className="ml-2 text-xs">{label}</span>}
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

          {/* Other Actions */}
          <div className="space-y-1">
            {showText && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Actions
              </h3>
            )}
            
            <div className="grid gap-1">
              {/* Overview */}
              {onShowCardOverview && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowCardOverview}
                        className={`${showText ? 'justify-start h-6' : 'aspect-square p-0 h-6 w-6'} transition-colors`}
                      >
                        <LayoutGrid className="w-2.5 h-2.5" />
                        {showText && <span className="ml-2 text-xs">Overview</span>}
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
                      className={`${showText ? 'justify-start h-6' : 'aspect-square p-0 h-6 w-6'} text-destructive hover:text-destructive transition-colors`}
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      {showText && <span className="ml-2 text-xs">Delete</span>}
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
