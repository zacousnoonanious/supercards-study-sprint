import React from 'react';
import { Navigation } from './Navigation';
import { EditorHeader } from './EditorHeader';
import { TopSettingsBar } from './TopSettingsBar';
import { UndockableToolbar } from './UndockableToolbar';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { EditorCardOverview } from './EditorCardOverview';
import { CardCanvas } from './CardCanvas';
import { FlashcardSet, Flashcard, CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface CardEditorLayoutProps {
  // State props
  showShortcuts: boolean;
  showCardOverview: boolean;
  deckName: string;
  cardWidth: number;
  cardHeight: number;
  zoom: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  isTextSelecting: boolean;

  // Data props
  set: FlashcardSet;
  cards: Flashcard[];
  currentCard: Flashcard;
  currentCardIndex: number;
  currentSide: 'front' | 'back';
  selectedElementId: string | null;

  // Refs
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  topSettingsBarRef: React.RefObject<HTMLDivElement>;
  canvasViewportRef: React.RefObject<HTMLDivElement>;

  // Handlers
  onSave: () => void;
  onUpdateDeckTitle: (title: string) => Promise<void>;
  onZoomChange: (zoom: number) => void;
  onFitToArea: () => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
  onElementSelect: (elementId: string | null) => void;
  onCanvasClick: (e: React.MouseEvent) => void;
  onNavigateToCard: (cardIndex: number) => void;
  onReorderCards: (cards: Flashcard[]) => void;
  onAddElement: (type: CanvasElement['type']) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: any) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => void;
  onShowCardOverview: () => void;
  onToolbarPositionChange: (position: 'left' | 'very-top' | 'canvas-left' | 'floating', isDocked: boolean) => void;
  onToolbarTextToggle: (showText: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setShowCardOverview: (show: boolean) => void;

  // Utility functions
  getCurrentElements: () => CanvasElement[];
  getSelectedElementData: () => CanvasElement | null;
}

export const CardEditorLayout: React.FC<CardEditorLayoutProps> = ({
  showShortcuts,
  showCardOverview,
  deckName,
  cardWidth,
  cardHeight,
  zoom,
  panOffset,
  isPanning,
  toolbarPosition,
  toolbarIsDocked,
  toolbarShowText,
  showGrid,
  snapToGrid,
  isTextSelecting,
  set,
  cards,
  currentCard,
  currentCardIndex,
  currentSide,
  selectedElementId,
  canvasContainerRef,
  topSettingsBarRef,
  canvasViewportRef,
  onSave,
  onUpdateDeckTitle,
  onZoomChange,
  onFitToArea,
  onUpdateElement,
  onDeleteElement,
  onCanvasSizeChange,
  onUpdateCard,
  onElementSelect,
  onCanvasClick,
  onNavigateToCard,
  onReorderCards,
  onAddElement,
  onAutoArrange,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onCreateNewCardFromTemplate,
  onDeleteCard,
  onCardTypeChange,
  onShowCardOverview,
  onToolbarPositionChange,
  onToolbarTextToggle,
  setShowShortcuts,
  setShowCardOverview,
  getCurrentElements,
  getSelectedElementData,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Calculate layout offset based on toolbar position and text display
  const getLayoutOffset = () => {
    if (toolbarIsDocked && toolbarPosition === 'left') {
      const leftMargin = toolbarShowText ? '14rem' : '4.5rem';
      return { marginLeft: leftMargin };
    }
    return {};
  };

  // Show card overview if toggled
  if (showCardOverview) {
    return (
      <div className="min-h-screen flex flex-col" style={getLayoutOffset()}>
        <Navigation />
        <EditorCardOverview
          cards={cards}
          currentCardIndex={currentCardIndex}
          onReorderCards={onReorderCards}
          onNavigateToCard={onNavigateToCard}
          onBackToEditor={() => setShowCardOverview(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <EditorHeader
        set={{ ...set, title: deckName }}
        onSave={onSave}
        isEditingDeckName={false}
        deckName={deckName}
        onDeckNameChange={() => {}}
        onStartEdit={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        onUpdateDeckTitle={onUpdateDeckTitle}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onFitToArea={onFitToArea}
      />

      {/* Top Settings Bar */}
      <div ref={topSettingsBarRef}>
        <TopSettingsBar
          selectedElement={getSelectedElementData()}
          onUpdateElement={onUpdateElement}
          onDeleteElement={onDeleteElement}
          canvasWidth={cardWidth}
          canvasHeight={cardHeight}
          onCanvasSizeChange={onCanvasSizeChange}
          currentCard={currentCard}
          onUpdateCard={onUpdateCard}
          showGrid={showGrid}
          onShowGridChange={() => {}}
          snapToGrid={snapToGrid}
          onSnapToGridChange={() => {}}
          currentSide={currentSide}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex items-center justify-center p-1" ref={canvasContainerRef}>
          <div className="flex items-start gap-1 h-full w-full max-w-none">
            {/* Canvas-Left Toolbar Position */}
            {toolbarIsDocked && toolbarPosition === 'canvas-left' && (
              <UndockableToolbar
                onAddElement={onAddElement}
                onAutoArrange={onAutoArrange}
                currentCard={currentCard}
                currentCardIndex={currentCardIndex}
                totalCards={cards.length}
                currentSide={currentSide}
                onNavigateCard={onNavigateCard}
                onSideChange={onSideChange}
                onCreateNewCard={onCreateNewCard}
                onCreateNewCardWithLayout={onCreateNewCardWithLayout}
                onCreateNewCardFromTemplate={onCreateNewCardFromTemplate}
                onDeleteCard={onDeleteCard}
                onCardTypeChange={onCardTypeChange}
                onShowCardOverview={onShowCardOverview}
                canvasRef={canvasContainerRef}
                topSettingsBarRef={topSettingsBarRef}
                onPositionChange={onToolbarPositionChange}
                onTextToggle={onToolbarTextToggle}
              />
            )}

            {/* Card Canvas and Footer Container */}
            <div className="flex flex-col flex-1 min-h-0 h-full">
              {/* Canvas Viewport with zoom and pan */}
              <div 
                ref={canvasViewportRef}
                className={`shadow-lg border overflow-hidden flex-1 relative ${
                  isDarkTheme 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${zoom > 1 && !isPanning ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
                style={{ 
                  minWidth: Math.max(cardWidth * 0.5, 400),
                  minHeight: Math.max(cardHeight * 0.5, 300),
                  userSelect: isPanning ? 'none' : 'auto',
                }}
                data-canvas-background="true"
                onClick={onCanvasClick}
              >
                <div
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                    transformOrigin: '0 0',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    pointerEvents: isPanning ? 'none' : 'auto',
                  }}
                  data-canvas-background="true"
                >
                  <CardCanvas
                    elements={getCurrentElements()}
                    selectedElement={selectedElementId}
                    onSelectElement={onElementSelect}
                    onUpdateElement={onUpdateElement}
                    onDeleteElement={onDeleteElement}
                    cardSide={currentSide}
                    style={{ 
                      width: cardWidth, 
                      height: cardHeight,
                      border: `2px solid ${isDarkTheme ? '#6b7280' : '#d1d5db'}`,
                      backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff'
                    }}
                    showGrid={showGrid}
                    gridSize={20}
                    snapToGrid={snapToGrid}
                    zoom={zoom}
                  />
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="flex-shrink-0">
                <SimpleEditorFooter
                  currentCard={currentCard}
                  currentCardIndex={currentCardIndex}
                  totalCards={cards.length}
                  selectedElement={getSelectedElementData()}
                  onUpdateCard={onUpdateCard}
                  onNavigateCard={onNavigateCard}
                  cardWidth={Math.max(cardWidth * 0.5, 400)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Toolbar Positions */}
      {(!toolbarIsDocked || toolbarPosition !== 'canvas-left') && (
        <UndockableToolbar
          onAddElement={onAddElement}
          onAutoArrange={onAutoArrange}
          currentCard={currentCard}
          currentCardIndex={currentCardIndex}
          totalCards={cards.length}
          currentSide={currentSide}
          onNavigateCard={onNavigateCard}
          onSideChange={onSideChange}
          onCreateNewCard={onCreateNewCard}
          onCreateNewCardWithLayout={onCreateNewCardWithLayout}
          onCreateNewCardFromTemplate={onCreateNewCardFromTemplate}
          onDeleteCard={onDeleteCard}
          onCardTypeChange={onCardTypeChange}
          onShowCardOverview={onShowCardOverview}
          canvasRef={canvasContainerRef}
          topSettingsBarRef={topSettingsBarRef}
          onPositionChange={onToolbarPositionChange}
          onTextToggle={onToolbarTextToggle}
        />
      )}

      {showShortcuts && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};
