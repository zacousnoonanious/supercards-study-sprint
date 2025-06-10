import React, { useState, useCallback, useEffect } from 'react';
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

  // Get current card early in the component
  const currentCard = cards[currentCardIndex];

  // Use handlers hook
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

  // Use canvas interaction hook
  useCanvasInteraction({
    canvasViewportRef,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    isTextSelecting,
  });

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    isTextSelecting,
    selectedElementId,
    handleDeleteElement,
    setSelectedElementId,
    currentCardIndex,
    cards,
    currentCard,
    navigateCard,
    setCurrentSide,
  });

  // Save card when switching cards or sides
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cards.length > 0 && currentCard) {
        updateCard(currentCard.id, currentCard);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [cards, currentCardIndex, updateCard, currentCard]);

  // Update deck name when set changes
  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title, setDeckName]);

  // Monitor text selection globally
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setIsTextSelecting(true);
      } else {
        setTimeout(() => {
          setIsTextSelecting(false);
        }, 100);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [setIsTextSelecting]);

  // Set canvas dimensions based on card data
  useEffect(() => {
    if (currentCard) {
      const width = currentCard.canvas_width || 600;
      const height = currentCard.canvas_height || 450;
      
      setCardWidth(width);
      setCardHeight(height);
    }
  }, [currentCard, setCardWidth, setCardHeight]);

  // Fit to area function
  const handleFitToArea = useCallback(() => {
    if (!canvasViewportRef.current) return;
    
    const viewportRect = canvasViewportRef.current.getBoundingClientRect();
    const viewportWidth = viewportRect.width;
    const viewportHeight = viewportRect.height;
    
    const padding = 40;
    const zoomX = (viewportWidth - padding) / cardWidth;
    const zoomY = (viewportHeight - padding) / cardHeight;
    const newZoom = Math.min(zoomX, zoomY, 3);
    
    const scaledWidth = cardWidth * newZoom;
    const scaledHeight = cardHeight * newZoom;
    const centerX = (viewportWidth - scaledWidth) / 2;
    const centerY = (viewportHeight - scaledHeight) / 2;
    
    setZoom(newZoom);
    setPanOffset({ x: centerX, y: centerY });
  }, [cardWidth, cardHeight, setZoom, setPanOffset, canvasViewportRef]);

  const getCurrentElements = () => {
    if (!currentCard) return [];
    return currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  };

  const getSelectedElementData = () => {
    if (!selectedElementId) return null;
    return getCurrentElements().find(el => el.id === selectedElementId) || null;
  };

  const handleSave = async () => {
    if (cards.length > 0 && currentCard) {
      await updateCard(currentCard.id, currentCard);
    }
  };

  const handleToolbarPositionChange = useCallback((position: 'left' | 'very-top' | 'canvas-left' | 'floating', isDocked: boolean) => {
    setToolbarPosition(position);
    setToolbarIsDocked(isDocked);
  }, [setToolbarPosition, setToolbarIsDocked]);

  const handleToolbarTextToggle = useCallback((showText: boolean) => {
    setToolbarShowText(showText);
  }, [setToolbarShowText]);

  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    console.log('Adding element of type:', type);
    if (type === 'tts') {
      addElement('text', {
        hasTTS: true,
        ttsEnabled: true,
        ttsAutoplay: false,
        ttsRate: 1,
        ttsPitch: 1,
        content: 'Click to edit and add speech'
      });
    } else {
      addElement(type);
    }
  }, [addElement]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isTextSelecting) return;
    
    if (e.target === e.currentTarget || (e.target as Element).hasAttribute('data-canvas-background')) {
      setSelectedElementId(null);
    }
  }, [setSelectedElementId, isTextSelecting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">{t('dashboard.noSets')}</p>
            <button 
              onClick={createNewCard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {t('dashboard.createFirst')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CardEditorLayout
      // State props
      showShortcuts={showShortcuts}
      showCardOverview={showCardOverview}
      deckName={deckName}
      cardWidth={cardWidth}
      cardHeight={cardHeight}
      zoom={zoom}
      panOffset={panOffset}
      isPanning={isPanning}
      toolbarPosition={toolbarPosition}
      toolbarIsDocked={toolbarIsDocked}
      toolbarShowText={toolbarShowText}
      showGrid={showGrid}
      snapToGrid={snapToGrid}
      isTextSelecting={isTextSelecting}

      // Data props
      set={set}
      cards={cards}
      currentCard={currentCard}
      currentCardIndex={currentCardIndex}
      currentSide={currentSide}
      selectedElementId={selectedElementId}

      // Refs
      canvasContainerRef={canvasContainerRef}
      topSettingsBarRef={topSettingsBarRef}
      canvasViewportRef={canvasViewportRef}

      // Handlers
      onSave={handleSave}
      onUpdateDeckTitle={handleUpdateDeckTitle}
      onZoomChange={setZoom}
      onFitToArea={handleFitToArea}
      onUpdateElement={handleUpdateElement}
      onDeleteElement={handleDeleteElement}
      onCanvasSizeChange={handleCanvasSizeChange}
      onUpdateCard={handleCardUpdate}
      onElementSelect={handleElementSelect}
      onCanvasClick={handleCanvasClick}
      onNavigateToCard={handleNavigateToCard}
      onReorderCards={reorderCards}
      onAddElement={handleAddElement}
      onAutoArrange={handleAutoArrange}
      onNavigateCard={navigateCard}
      onSideChange={setCurrentSide}
      onCreateNewCard={createNewCard}
      onCreateNewCardWithLayout={createNewCardWithLayout}
      onCreateNewCardFromTemplate={createNewCardFromTemplate}
      onDeleteCard={() => deleteCard(currentCard.id)}
      onCardTypeChange={(type) => updateCard(currentCard.id, { card_type: type })}
      onShowCardOverview={() => setShowCardOverview(true)}
      onToolbarPositionChange={handleToolbarPositionChange}
      onToolbarTextToggle={handleToolbarTextToggle}
      setShowShortcuts={setShowShortcuts}
      setShowCardOverview={setShowCardOverview}

      // Utility functions
      getCurrentElements={getCurrentElements}
      getSelectedElementData={getSelectedElementData}
    />
  );
};

export default CardEditor;
