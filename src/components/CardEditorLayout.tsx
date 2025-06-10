
import React from 'react';
import { TopToolbar } from './TopToolbar';
import { BottomToolbar } from './BottomToolbar';
import { CardCanvas } from './CardCanvas';
import { SidePanel } from './SidePanel';
import { TopSettingsBar } from './TopSettingsBar';
import { Flashcard, CanvasElement } from '@/types/flashcard';
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
  onDeckTitleChange: (title: string) => void;
  onCardSideChange: (side: 'front' | 'back') => void;
  onElementSelect: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
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
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const canvasStyle = {
    width: cardWidth,
    height: cardHeight,
  };

  return (
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
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
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
      />
    </div>
  );
};
