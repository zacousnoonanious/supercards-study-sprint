import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useCardEditor } from '@/hooks/useCardEditor';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { CardEditorLayout } from './CardEditorLayout';
import { FullscreenEditor } from './FullscreenEditor';
import { CanvasElement } from '@/types/flashcard';
import { useTemplateConfiguration } from '@/hooks/useTemplateConfiguration';
import { useEnhancedKeyboardShortcuts } from '@/hooks/useEnhancedKeyboardShortcuts';

interface CardEditorProps {
  setId?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({ setId }) => {
  const { t } = useI18n();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [hasAppliedTemplateSettings, setHasAppliedTemplateSettings] = useState(false);
  const { getCardTemplateSettings } = useTemplateConfiguration();

  const {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElementId,
    loading,
    setCurrentSide,
    setSelectedElementId,
    setCurrentCardIndex,
    addElement,
    updateElement,
    updateCard,
    updateCanvasSize,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
    initializeEditor,
  } = useCardEditor();

  // Initialize the editor when setId is provided
  useEffect(() => {
    if (setId) {
      initializeEditor(setId);
    }
  }, [setId, initializeEditor]);

  const currentCard = cards[currentCardIndex];
  console.log('CardEditor: Current card:', currentCard?.id, 'Index:', currentCardIndex, 'Total cards:', cards.length);

  // Initialize collaborative editing
  const {
    activeUsers,
    collaborators,
    isCollaborative,
    updateUserPosition,
    enableCollaboration,
    removeCollaborator,
  } = useCollaborativeEditing({
    setId: setId || '',
    cardId: currentCard?.id,
  });

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
    showBorder,
    setShowBorder,
    isTextSelecting,
    setIsTextSelecting,
    canvasContainerRef,
    topSettingsBarRef,
    canvasViewportRef,
  } = useCardEditorState(currentCard);

  const selectedElement = currentCard ? 
    [...(currentCard.front_elements || []), ...(currentCard.back_elements || [])]
      .find(el => el.id === selectedElementId) || null : null;

  // Get template settings for current card
  const templateSettings = currentCard ? getCardTemplateSettings(currentCard) : null;

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
    updateCanvasSize,
    isTextSelecting,
    set,
    setDeckName,
    currentSide,
    selectedElementId,
  });

  const {
    startPan,
    panCanvas,
    endPan,
    handleWheel,
    fitToView,
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

  // Enhanced keyboard shortcuts with cursor position support
  useEnhancedKeyboardShortcuts({
    onAddElement: addElement,
    onDeleteElement: handleDeleteElement,
    onNavigateCard: navigateCard,
    onSideChange: setCurrentSide,
    onCreateNewCard: createNewCard,
    onSaveCard: () => currentCard && updateCard({}),
    onAutoArrange: handleAutoArrange,
    onShowCardOverview: () => setShowCardOverview(!showCardOverview),
    onCopyElement: () => {
      // TODO: Implement copy element
      console.log('Copy element');
    },
    onPasteElement: () => {
      // TODO: Implement paste element
      console.log('Paste element');
    },
    selectedElementId,
    isTextSelecting,
    currentCardIndex,
    totalCards: cards.length,
    currentSide,
  });

  // Update user position when card changes
  useEffect(() => {
    if (currentCard && updateUserPosition) {
      updateUserPosition(currentCard.id);
    }
  }, [currentCard?.id, updateUserPosition]);

  const handleDeleteCard = async () => {
    if (currentCard) {
      return await deleteCard(currentCard.id);
    }
    return false;
  };

  const handleOpenFullscreen = () => {
    setShowFullscreen(true);
  };

  useEffect(() => {
    if (set) {
      setDeckName(set.title);
    }
  }, [set]);

  // Only apply template settings once when the card changes, not on every render
  useEffect(() => {
    if (currentCard && templateSettings && !hasAppliedTemplateSettings) {
      if (templateSettings.showGrid !== undefined) {
        setShowGrid(templateSettings.showGrid);
      }
      if (templateSettings.snapToGrid !== undefined) {
        setSnapToGrid(templateSettings.snapToGrid);
      }
      if (templateSettings.showBorder !== undefined) {
        setShowBorder(templateSettings.showBorder);
      }
      setHasAppliedTemplateSettings(true);
    }
  }, [currentCard, templateSettings, hasAppliedTemplateSettings, setShowGrid, setSnapToGrid, setShowBorder]);

  // Reset the flag when card changes
  useEffect(() => {
    setHasAppliedTemplateSettings(false);
  }, [currentCard?.id]);

  if (loading) {
    console.log('CardEditor: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  if (!set) {
    console.log('CardEditor: Missing set data');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('cardNotFound')}</div>
      </div>
    );
  }

  // Show empty state if no cards
  if (cards.length === 0) {
    return (
      <CardEditorLayout
        cards={[]}
        currentCard={null}
        currentCardIndex={0}
        currentSide={currentSide}
        selectedElement={null}
        deckName={deckName}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        zoom={zoom}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        showBorder={showBorder}
        toolbarPosition={toolbarPosition}
        toolbarIsDocked={toolbarIsDocked}
        toolbarShowText={toolbarShowText}
        isPanning={isPanning}
        showCardOverview={showCardOverview}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSnapToGridChange={setSnapToGrid}
        onShowBorderChange={setShowBorder}
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
        onAddElement={addElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={createNewCardWithLayout}
        onCreateNewCardFromTemplate={createNewCardFromTemplate}
        onDeleteCard={handleDeleteCard}
        onShowCardOverview={() => setShowCardOverview(!showCardOverview)}
        onFitToView={fitToView}
        onOpenFullscreen={handleOpenFullscreen}
        // Collaboration props
        isCollaborative={isCollaborative}
        collaborators={collaborators}
        onEnableCollaboration={enableCollaboration}
        onRemoveCollaborator={removeCollaborator}
        // Pass collaboration data to TopToolbar
        activeUsers={activeUsers}
        currentCardId={currentCard?.id}
        showEmptyState={true}
      />
    );
  }

  console.log('CardEditor: Rendering with set:', set.title, 'and card:', currentCard?.question);

  const handleCardUpdate = useCallback((updates: Partial<Flashcard>) => {
    updateCard(updates);
  }, [updateCard]);

  return (
    <div className="flex flex-col h-screen">
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
        showBorder={showBorder}
        toolbarPosition={toolbarPosition}
        toolbarIsDocked={toolbarIsDocked}
        toolbarShowText={toolbarShowText}
        isPanning={isPanning}
        showCardOverview={showCardOverview}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSnapToGridChange={setSnapToGrid}
        onShowBorderChange={setShowBorder}
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
        onAddElement={addElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={createNewCardWithLayout}
        onCreateNewCardFromTemplate={createNewCardFromTemplate}
        onDeleteCard={handleDeleteCard}
        onShowCardOverview={() => setShowCardOverview(!showCardOverview)}
        onFitToView={fitToView}
        onOpenFullscreen={handleOpenFullscreen}
        // Collaboration props
        isCollaborative={isCollaborative}
        collaborators={collaborators}
        onEnableCollaboration={enableCollaboration}
        onRemoveCollaborator={removeCollaborator}
        // Pass collaboration data to TopToolbar
        activeUsers={activeUsers}
        currentCardId={currentCard?.id}
      />
      
      <FullscreenEditor
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        currentCard={currentCard}
        currentSide={currentSide}
        selectedElement={selectedElement}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        onElementSelect={handleElementSelect}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onAddElement={addElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onSideChange={setCurrentSide}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={createNewCardWithLayout}
        onCreateNewCardFromTemplate={createNewCardFromTemplate}
        onDeleteCard={handleDeleteCard}
        currentCardIndex={currentCardIndex}
        totalCards={cards.length}
      />
    </div>
  );
};
