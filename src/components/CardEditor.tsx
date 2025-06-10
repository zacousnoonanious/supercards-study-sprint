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
    updateCard: (cardId: string, updates) => updateCard(currentCard.id, updates),
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
    showShortcuts,
    setShowShortcuts,
    showCardOverview,
    setShowCardOverview,
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
        set={set}
        cards={cards}
        currentCardIndex={currentCardIndex}
        currentSide={currentSide}
        setCurrentSide={setCurrentSide}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        zoom={zoom}
        setZoom={setZoom}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
        isPanning={isPanning}
        setIsPanning={setIsPanning}
        startPan={startPan}
        panCanvas={panCanvas}
        endPan={endPan}
        handleWheel={handleWheel}
        toolbarPosition={toolbarPosition}
        setToolbarPosition={setToolbarPosition}
        toolbarIsDocked={toolbarIsDocked}
        setToolbarIsDocked={setToolbarIsDocked}
        toolbarShowText={toolbarShowText}
        setToolbarShowText={setToolbarShowText}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        canvasContainerRef={canvasContainerRef}
        topSettingsBarRef={topSettingsBarRef}
        canvasViewportRef={canvasViewportRef}
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onElementSelect={handleElementSelect}
        onCanvasSizeChange={handleCanvasSizeChange}
        onUpdateCard={handleCardUpdate}
      />
    </div>
  );
};
