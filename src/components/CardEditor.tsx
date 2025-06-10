
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useCardEditor } from '@/hooks/useCardEditor';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { CardEditorLayout } from './CardEditorLayout';
import { Navigation } from './Navigation';
import { CanvasElement } from '@/types/flashcard';

interface CardEditorProps {
  setId?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({ setId }) => {
  const { t } = useI18n();

  const {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElement: selectedElementId,
    loading,
    setCurrentSide,
    setSelectedElement: setSelectedElementId,
    setCurrentCardIndex,
    addElement,
    updateElement,
    updateCard,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
  } = useCardEditor();

  const {
    showShortcuts,
    setShowShortcuts,
    showCardOverview,
    setShowCardOverview,
    deckName,
    setDeckName,
    cardWidth,
    setCardWidth,
    cardHeight,
    setCardHeight,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    toolbarPosition,
    setToolbarPosition,
    toolbarIsDocked,
    setToolbarIsDocked,
    toolbarShowText,
    setToolbarShowText,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    isTextSelecting,
    setIsTextSelecting,
    canvasContainerRef,
    topSettingsBarRef,
    canvasViewportRef,
  } = useCardEditorState();

  const currentCard = cards[currentCardIndex];
  const selectedElement = currentCard ? 
    [...(currentCard.front_elements || []), ...(currentCard.back_elements || [])]
      .find(el => el.id === selectedElementId) || null : null;

  const {
    handleUpdateElement,
    handleDeleteElement,
    handleElementSelect,
    handleNavigateToCard,
    handleUpdateDeckTitle,
    handleAutoArrange,
    handleCanvasSizeChange,
    handleCardUpdate,
  } = useCardEditorHandlers({
    updateElement,
    deleteElement,
    setSelectedElementId,
    setCurrentCardIndex,
    cards,
    currentCard,
    navigateCard,
    setCurrentSide,
    updateCard,
    isTextSelecting,
    set,
    setDeckName,
  });

  const {
    startPan,
    panCanvas,
    endPan,
    handleWheel,
  } = useCanvasInteraction({
    canvasContainerRef,
    canvasViewportRef,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    panOffset,
    setPanOffset,
    zoom,
    setZoom,
    cardWidth,
    cardHeight,
  });

  useKeyboardShortcuts({
    zoom,
    setZoom,
    addElement,
    selectedElementId,
    handleDeleteElement,
    currentCardIndex,
    cards,
    navigateCard,
    currentSide,
    setCurrentSide,
    handleAutoArrange,
    isTextSelecting,
    showCardOverview,
    setShowCardOverview,
  });

  useEffect(() => {
    if (setId) {
      // You might want to trigger a loadSet action here
      // loadSet(setId); // Assuming you have a loadSet action
    }
  }, [setId]);

  useEffect(() => {
    if (set) {
      setDeckName(set.title);
    }
  }, [set]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  if (!set || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('cardNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <CardEditorLayout
        cards={cards}
        currentCard={currentCard}
        currentCardIndex={currentCardIndex}
        currentSide={currentSide}
        selectedElement={selectedElement}
        deckName={deckName}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        zoom={zoom}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        toolbarPosition={toolbarPosition}
        toolbarIsDocked={toolbarIsDocked}
        toolbarShowText={toolbarShowText}
        isPanning={isPanning}
        showCardOverview={showCardOverview}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSnapToGridChange={setSnapToGrid}
        onToolbarPositionChange={setToolbarPosition}
        onToolbarDockChange={setToolbarIsDocked}
        onToolbarShowTextChange={setToolbarShowText}
        onShowCardOverviewChange={setShowCardOverview}
        onDeckTitleChange={handleUpdateDeckTitle}
        onCardSideChange={setCurrentSide}
        onElementSelect={handleElementSelect}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onCanvasSizeChange={handleCanvasSizeChange}
        onUpdateCard={handleCardUpdate}
      />
    </div>
  );
};
