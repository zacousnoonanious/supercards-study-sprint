import React from 'react';
import { TopToolbar } from './TopToolbar';
import { BottomToolbar } from './BottomToolbar';
import { CardCanvas } from './CardCanvas';
import { SidePanel } from './SidePanel';
import { TopSettingsBar } from './TopSettingsBar';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { EnhancedSetOverview } from './EnhancedSetOverview';
import { Navigation } from './Navigation';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface CardEditorLayoutProps {
  cards: Flashcard[];
  currentCard: Flashcard;
  currentCardIndex: number;
  currentSide: 'front' | 'back';
  selectedElement: CanvasElement | null;
  deckName: string;
  cardWidth: number;
  cardHeight: number;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  isPanning: boolean;
  showCardOverview: boolean;
  onZoomChange: (zoom: number) => void;
  onShowGridChange: (show: boolean) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onToolbarPositionChange: (position: 'left' | 'very-top' | 'canvas-left' | 'floating') => void;
  onToolbarDockChange: (docked: boolean) => void;
  onToolbarShowTextChange: (showText: boolean) => void;
  onShowCardOverviewChange: (show: boolean) => void;
  onDeckTitleChange: (title: string) => Promise<void>;
  onCardSideChange: (side: 'front' | 'back') => void;
  onElementSelect: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => void;
  onShowCardOverview?: () => void;
  onFitToView?: () => void;
  onOpenFullscreen?: () => void;
}

export const CardEditorLayout: React.FC<CardEditorLayoutProps> = ({
  cards,
  currentCard,
  currentCardIndex,
  currentSide,
  selectedElement,
  deckName,
  cardWidth,
  cardHeight,
  zoom,
  showGrid,
  snapToGrid,
  toolbarPosition,
  toolbarIsDocked,
  toolbarShowText,
  isPanning,
  showCardOverview,
  onZoomChange,
  onShowGridChange,
  onSnapToGridChange,
  onToolbarPositionChange,
  onToolbarDockChange,
  onToolbarShowTextChange,
  onShowCardOverviewChange,
  onDeckTitleChange,
  onCardSideChange,
  onElementSelect,
  onUpdateElement,
  onDeleteElement,
  onCanvasSizeChange,
  onUpdateCard,
  onAddElement,
  onAutoArrange,
  onNavigateCard,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onCreateNewCardFromTemplate,
  onDeleteCard,
  onCardTypeChange,
  onShowCardOverview,
  onFitToView,
  onOpenFullscreen,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const canvasStyle = {
    width: cardWidth,
    height: cardHeight,
  };

  // Handle reordering cards for the enhanced overview
  const handleReorderCards = (reorderedCards: Flashcard[]) => {
    // This would need to be passed down from parent or handled via context
    console.log('Reorder cards:', reorderedCards);
  };

  // Handle navigation to card from overview
  const handleNavigateToCard = (cardIndex: number) => {
    onShowCardOverviewChange(false);
    // Navigate to the specific card index
    const targetCard = cards[cardIndex];
    if (targetCard) {
      // This would trigger navigation to that card
      console.log('Navigate to card:', cardIndex);
    }
  };

  // Show enhanced overview if requested
  if (showCardOverview) {
    return (
      <div className="flex flex-col h-screen">
        <Navigation />
        <EnhancedSetOverview
          cards={cards}
          setId={currentCard.set_id}
          onReorderCards={handleReorderCards}
          onNavigateToCard={handleNavigateToCard}
          onBackToSet={() => onShowCardOverviewChange(false)}
          onCreateCard={onCreateNewCard}
          onCreateFromTemplate={onCreateNewCardFromTemplate}
          onSetDefaultTemplate={() => {}}
          onDeleteCard={(cardId) => {
            const cardIndex = cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              onDeleteCard();
            }
          }}
          onStudyFromCard={(cardIndex) => {
            console.log('Study from card:', cardIndex);
          }}
          permanentShuffle={false}
          onPermanentShuffleChange={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopToolbar
          deckName={deckName}
          currentCardIndex={currentCardIndex}
          cards={cards}
          showShortcuts={false}
          showCardOverview={showCardOverview}
          onDeckTitleChange={onDeckTitleChange}
          onShowCardOverviewChange={onShowCardOverviewChange}
        />
        
        <TopSettingsBar
          selectedElement={selectedElement}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
          canvasWidth={cardWidth}
          canvasHeight={cardHeight}
          onCanvasSizeChange={onCanvasSizeChange}
          currentCard={currentCard}
          onUpdateCard={onUpdateCard}
          showGrid={showGrid}
          onShowGridChange={onShowGridChange}
          snapToGrid={snapToGrid}
          onSnapToGridChange={onSnapToGridChange}
          currentSide={currentSide}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Toolbar Panel - Dynamic width based on text mode */}
          <div className={`${toolbarShowText ? 'w-48' : 'w-20'} border-r bg-background overflow-y-auto transition-all duration-200`}>
            <ConsolidatedToolbar
              onAddElement={onAddElement}
              onAutoArrange={onAutoArrange}
              currentCard={currentCard}
              currentCardIndex={currentCardIndex}
              totalCards={cards.length}
              currentSide={currentSide}
              onNavigateCard={onNavigateCard}
              onSideChange={onCardSideChange}
              onCreateNewCard={onCreateNewCard}
              onCreateNewCardWithLayout={onCreateNewCardWithLayout}
              onCreateNewCardFromTemplate={onCreateNewCardFromTemplate}
              onDeleteCard={onDeleteCard}
              onCardTypeChange={onCardTypeChange}
              onShowCardOverview={() => onShowCardOverviewChange(!showCardOverview)}
              position="left"
              isDocked={true}
              showText={toolbarShowText}
              onTextToggle={onToolbarShowTextChange}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative">
            <div
              className="relative"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: cardWidth,
                height: cardHeight,
                cursor: isPanning ? 'grabbing' : 'default',
              }}
            >
              <CardCanvas
                elements={currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements}
                selectedElement={selectedElement?.id || null}
                onSelectElement={onElementSelect}
                onUpdateElement={onUpdateElement}
                onDeleteElement={onDeleteElement}
                cardSide={currentSide}
                style={canvasStyle}
                showGrid={showGrid}
                snapToGrid={snapToGrid}
                zoom={zoom}
              />
            </div>
          </div>

          {/* Right Side Panel */}
          <SidePanel
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        </div>

        <BottomToolbar
          zoom={zoom}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          toolbarPosition={toolbarPosition}
          toolbarIsDocked={toolbarIsDocked}
          toolbarShowText={toolbarShowText}
          onZoomChange={onZoomChange}
          onShowGridChange={onShowGridChange}
          onSnapToGridChange={onSnapToGridChange}
          onToolbarPositionChange={onToolbarPositionChange}
          onToolbarDockChange={onToolbarDockChange}
          onToolbarShowTextChange={onToolbarShowTextChange}
          currentSide={currentSide}
          onCardSideChange={onCardSideChange}
          onFitToView={onFitToView}
          onOpenFullscreen={onOpenFullscreen}
        />
      </div>
    </div>
  );
};
