import React, { useEffect } from 'react';
import { TopToolbar } from './TopToolbar';
import { BottomToolbar } from './BottomToolbar';
import { CardCanvas } from './CardCanvas';
import { SidePanel } from './SidePanel';
import { TopSettingsBar } from './TopSettingsBar';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { EnhancedSetOverview } from './EnhancedSetOverview';
import { Navigation } from './Navigation';
import { CollaborationDialog } from './collaboration/CollaborationDialog';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { CollaboratorInfo, CollaborativeUser } from '@/hooks/useCollaborativeEditing';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CardEditorLayoutProps {
  cards: Flashcard[];
  currentCard: Flashcard | null;
  currentCardIndex: number;
  currentSide: 'front' | 'back';
  selectedElement: CanvasElement | null;
  deckName: string;
  cardWidth: number;
  cardHeight: number;
  zoom: number;
  
  // CRITICAL: Visual editor props - these are LOCAL ONLY and should NOT sync with database
  showGrid: boolean;
  snapToGrid: boolean;
  showBorder: boolean;
  autoAlign: boolean;
  
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  isPanning: boolean;
  showCardOverview: boolean;
  onZoomChange: (zoom: number) => void;
  
  // CRITICAL: These handlers manage LOCAL ONLY visual editor state
  onShowGridChange: (show: boolean) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onShowBorderChange: (show: boolean) => void;
  onAutoAlignChange: (align: boolean) => void;
  
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
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-right' | 'align-elements-center' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit') => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onShowCardOverview?: () => void;
  onFitToView?: () => void;
  onOpenFullscreen?: () => void;
  // Collaboration props
  isCollaborative?: boolean;
  collaborators?: CollaboratorInfo[];
  activeUsers?: CollaborativeUser[];
  currentCardId?: string;
  onEnableCollaboration?: () => Promise<boolean>;
  onRemoveCollaborator?: (collaboratorId: string) => Promise<boolean>;
  showEmptyState?: boolean;
}

/**
 * CardEditorLayout Component
 * 
 * Main layout for the card editor with proper separation of concerns:
 * - Visual editor features (grid, snap, border) are LOCAL ONLY
 * - Canvas operations and element management sync with database
 * - Proper state isolation prevents unwanted side effects
 */
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
  showBorder,
  autoAlign,
  toolbarPosition,
  toolbarIsDocked,
  toolbarShowText,
  isPanning,
  showCardOverview,
  onZoomChange,
  onShowGridChange,
  onSnapToGridChange,
  onShowBorderChange,
  onAutoAlignChange,
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
  onShowCardOverview,
  onFitToView,
  onOpenFullscreen,
  // Collaboration props
  isCollaborative = false,
  collaborators = [],
  activeUsers = [],
  currentCardId,
  onEnableCollaboration,
  onRemoveCollaborator,
  showEmptyState = false,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Add keyboard navigation for card switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input fields or textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Only handle if Ctrl/Cmd is pressed to avoid conflicts with other shortcuts
      const isModifierPressed = e.ctrlKey || e.metaKey;

      switch (e.key) {
        case 'ArrowLeft':
          if (isModifierPressed) {
            e.preventDefault();
            e.stopPropagation();
            if (currentCardIndex > 0) {
              console.log('CardEditor: Keyboard navigate to previous card');
              onNavigateCard('prev');
            }
          }
          break;
        case 'ArrowRight':
          if (isModifierPressed) {
            e.preventDefault();
            e.stopPropagation();
            if (currentCardIndex < cards.length - 1) {
              console.log('CardEditor: Keyboard navigate to next card');
              onNavigateCard('next');
            }
          }
          break;
        case 'ArrowUp':
          if (isModifierPressed) {
            e.preventDefault();
            e.stopPropagation();
            if (currentSide === 'back') {
              console.log('CardEditor: Keyboard switch to front side');
              onCardSideChange('front');
            }
          }
          break;
        case 'ArrowDown':
          if (isModifierPressed) {
            e.preventDefault();
            e.stopPropagation();
            if (currentSide === 'front') {
              console.log('CardEditor: Keyboard switch to back side');
              onCardSideChange('back');
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, cards.length, currentSide, onNavigateCard, onCardSideChange]);

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

  // Mock functions for AI features
  const handleTagsUpdate = (tags: string[]) => {
    console.log('Tags updated:', tags);
  };

  const handleCreateCard = (question: string, answer: string) => {
    console.log('Create card:', question, answer);
    onCreateNewCard();
  };

  const handleApplyLayout = (elements: CanvasElement[]) => {
    console.log('Apply layout:', elements);
    // This would update the current card's elements
    if (currentCard) {
      const updates = currentSide === 'front' 
        ? { front_elements: elements }
        : { back_elements: elements };
      onUpdateCard(updates);
    }
  };

  // Show enhanced overview if requested
  if (showCardOverview) {
    return (
      <div className="flex flex-col h-screen">
        <Navigation />
        <EnhancedSetOverview
          cards={cards}
          setId={currentCard?.set_id || ''}
          onReorderCards={() => {}}
          onNavigateToCard={() => onShowCardOverviewChange(false)}
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
          collaborationDialog={
            onEnableCollaboration ? (
              <CollaborationDialog
                setId={currentCard?.set_id || ''}
                collaborators={collaborators}
                isCollaborative={isCollaborative}
                onEnableCollaboration={onEnableCollaboration}
                onRemoveCollaborator={onRemoveCollaborator}
              />
            ) : undefined
          }
          activeUsers={activeUsers}
          collaborators={collaborators}
          currentCardId={currentCardId}
          isCollaborative={isCollaborative}
          onNavigateCard={cards.length > 0 ? onNavigateCard : undefined}
        />
        
        {!showEmptyState && currentCard && (
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
            showBorder={showBorder}
            onShowBorderChange={onShowBorderChange}
            currentSide={currentSide}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Left Toolbar Panel - Dynamic width based on text mode */}
          <div className={`${toolbarShowText ? 'w-36' : 'w-10'} border-r bg-background overflow-y-auto transition-all duration-200`}>
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
              onShowCardOverview={() => onShowCardOverviewChange(!showCardOverview)}
              position="left"
              isDocked={true}
              showText={toolbarShowText}
              onTextToggle={onToolbarShowTextChange}
            />
          </div>

          {/* Canvas Area */}
          <div 
            className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
            data-canvas-background="true"
          >
            {showEmptyState ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
                <p className="text-muted-foreground mb-4">Consider adding your first one!</p>
                <Button onClick={onCreateNewCard} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Card
                </Button>
              </div>
            ) : currentCard ? (
              <div
                className="relative"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
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
                  style={{ width: cardWidth, height: cardHeight }}
                  showGrid={showGrid}
                  snapToGrid={snapToGrid}
                  showBorder={showBorder}
                  zoom={zoom}
                />
              </div>
            ) : null}
          </div>

          {/* Right Side Panel */}
          {!showEmptyState && currentCard && (
            <SidePanel
              selectedElement={selectedElement}
              onUpdateElement={onUpdateElement}
              onDeleteElement={onDeleteElement}
              currentCard={currentCard}
              currentSide={currentSide}
              onTagsUpdate={() => {}}
              onCreateCard={() => onCreateNewCard()}
              onApplyLayout={() => {}}
            />
          )}
        </div>

        {!showEmptyState && (
          <BottomToolbar
            zoom={zoom}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            showBorder={showBorder}
            autoAlign={autoAlign}
            toolbarPosition={toolbarPosition}
            toolbarIsDocked={toolbarIsDocked}
            toolbarShowText={toolbarShowText}
            onZoomChange={onZoomChange}
            onShowGridChange={onShowGridChange}
            onSnapToGridChange={onSnapToGridChange}
            onShowBorderChange={onShowBorderChange}
            onAutoAlignChange={onAutoAlignChange}
            onToolbarPositionChange={onToolbarPositionChange}
            onToolbarDockChange={onToolbarDockChange}
            onToolbarShowTextChange={onToolbarShowTextChange}
            currentSide={currentSide}
            onCardSideChange={onCardSideChange}
            onFitToView={onFitToView}
            onOpenFullscreen={onOpenFullscreen}
          />
        )}
      </div>
    </div>
  );
};
