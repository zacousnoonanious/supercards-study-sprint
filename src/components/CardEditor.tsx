
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useCardEditor } from '@/hooks/useCardEditor';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { CardEditorLayout } from './CardEditorLayout';
import { FullscreenEditor } from './FullscreenEditor';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { useTemplateConfiguration } from '@/hooks/useTemplateConfiguration';
import { useEnhancedKeyboardShortcuts } from '@/hooks/useEnhancedKeyboardShortcuts';

interface CardEditorProps {
  setId?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({ setId }) => {
  const { t } = useI18n();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const initializationRef = useRef<string | null>(null);
  
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

  // Initialize the editor only once per setId
  useEffect(() => {
    if (setId && setId !== initializationRef.current) {
      console.log('Initializing editor with setId:', setId);
      initializationRef.current = setId;
      initializeEditor(setId);
    }
  }, [setId, initializeEditor]);

  const currentCard = useMemo(() => cards[currentCardIndex], [cards, currentCardIndex]);
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

  const selectedElement = useMemo(() => {
    if (!currentCard) return null;
    return [...(currentCard.front_elements || []), ...(currentCard.back_elements || [])]
      .find(el => el.id === selectedElementId) || null;
  }, [currentCard, selectedElementId]);

  // Get template settings for current card
  const { getCardTemplateSettings } = useTemplateConfiguration();
  const templateSettings = useMemo(() => {
    return currentCard ? getCardTemplateSettings(currentCard) : null;
  }, [currentCard, getCardTemplateSettings]);

  const {
    handleUpdateElement,
    handleDeleteElement,
    handleElementSelect,
    handleNavigateToCard,
    handleUpdateDeckTitle,
    handleAutoArrange,
    handleCanvasSizeChange,
  } = useCardEditorHandlers({
    updateElement,
    deleteElement,
    setSelectedElementId,
    setCurrentCardIndex,
    cards,
    currentCard,
    navigateCard,
    setCurrentSide,
    currentSide,
    updateCard,
    updateCanvasSize,
    isTextSelecting,
    set,
    setDeckName,
    selectedElementId,
  });

  // Create a wrapper for updateCard that matches the expected signature for the layout
  const handleCardUpdate = useCallback((updates: Partial<Flashcard>) => {
    if (currentCard) {
      updateCard(updates);
    }
  }, [updateCard, currentCard]);

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

  // Wrapper function for addElement that matches the expected signature
  const handleAddElement = useCallback((type: string) => {
    addElement(type);
  }, [addElement]);

  // Wrapper function for createNewCardWithLayout that matches the expected signature
  const handleCreateNewCardWithLayout = useCallback(() => {
    createNewCardWithLayout();
  }, [createNewCardWithLayout]);

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

  // Update user position when card changes - only when actually needed
  useEffect(() => {
    if (currentCard?.id && updateUserPosition) {
      updateUserPosition(currentCard.id);
    }
  }, [currentCard?.id, updateUserPosition]);

  const handleDeleteCard = useCallback(async () => {
    if (currentCard) {
      return await deleteCard(currentCard.id);
    }
    return false;
  }, [currentCard, deleteCard]);

  const handleOpenFullscreen = useCallback(() => {
    setShowFullscreen(true);
  }, []);

  // Set deck name when set is available - only when set changes
  useEffect(() => {
    if (set?.title && set.title !== deckName) {
      setDeckName(set.title);
    }
  }, [set?.title, deckName, setDeckName]);

  // Apply template settings - only when template settings actually change
  useEffect(() => {
    if (templateSettings) {
      if (templateSettings.showGrid !== undefined && templateSettings.showGrid !== showGrid) {
        setShowGrid(templateSettings.showGrid);
      }
      if (templateSettings.snapToGrid !== undefined && templateSettings.snapToGrid !== snapToGrid) {
        setSnapToGrid(templateSettings.snapToGrid);
      }
      if (templateSettings.showBorder !== undefined && templateSettings.showBorder !== showBorder) {
        setShowBorder(templateSettings.showBorder);
      }
    }
  }, [templateSettings?.showGrid, templateSettings?.snapToGrid, templateSettings?.showBorder, showGrid, snapToGrid, showBorder, setShowGrid, setSnapToGrid, setShowBorder]);

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
        onAddElement={handleAddElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={handleCreateNewCardWithLayout}
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
        onAddElement={handleAddElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={handleCreateNewCardWithLayout}
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
        onAddElement={handleAddElement}
        onAutoArrange={handleAutoArrange}
        onNavigateCard={navigateCard}
        onSideChange={setCurrentSide}
        onCreateNewCard={createNewCard}
        onCreateNewCardWithLayout={handleCreateNewCardWithLayout}
        onCreateNewCardFromTemplate={createNewCardFromTemplate}
        onDeleteCard={handleDeleteCard}
        currentCardIndex={currentCardIndex}
        totalCards={cards.length}
      />
    </div>
  );
};
