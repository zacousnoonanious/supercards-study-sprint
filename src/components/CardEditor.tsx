import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { CardEditorLayout } from './CardEditorLayout';
import { transformDatabaseCardToFlashcard } from '@/utils/cardTransforms';
import { updateFlashcard } from '@/lib/api/flashcards';
import { useToast } from '@/hooks/use-toast';

/**
 * CardEditor Component
 * 
 * Main card editor with PROTECTED visual editor state management and undo/redo functionality.
 * CRITICAL: Visual editor features (grid, snap, border) are locally managed
 * and protected from external state resets.
 */
export const CardEditor: React.FC = () => {
  const { setId, cardId, id } = useParams<{ setId?: string; cardId?: string; id?: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Handle both route patterns: /edit/:setId/:cardId and /set/:id/edit/:cardId
  const actualSetId = setId || id;
  
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  console.log('CardEditor: Initialized with params:', { setId, cardId, id, actualSetId });

  const {
    data: set,
    isLoading: isSetLoading,
    error: setQueryError,
  } = useQuery({
    queryKey: ['set', actualSetId],
    queryFn: async () => {
      console.log('CardEditor: Fetching set data for:', actualSetId);
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', actualSetId)
        .single();

      if (error) {
        console.error('Error fetching set:', error);
        throw new Error(`Failed to fetch set: ${error.message}`);
      }
      console.log('CardEditor: Set data fetched successfully:', data);
      return data;
    },
    enabled: !!actualSetId,
  });

  const {
    data: cards,
    isLoading: isCardsLoading,
    error: cardsQueryError,
  } = useQuery({
    queryKey: ['cards', actualSetId],
    queryFn: async () => {
      console.log('CardEditor: Fetching cards for set:', actualSetId);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', actualSetId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching cards:', error);
        throw new Error(`Failed to fetch cards: ${error.message}`);
      }
      
      console.log('CardEditor: Cards fetched successfully:', data?.length, 'cards');
      // Transform database rows to match Flashcard interface
      return data.map(card => transformDatabaseCardToFlashcard(card));
    },
    enabled: !!actualSetId,
  });

  const currentCardIndex = useMemo(() => {
    if (!cardId || !cards) return 0;
    const index = cards.findIndex((card) => card.id === cardId);
    console.log('CardEditor: Current card index:', index, 'for cardId:', cardId);
    return index >= 0 ? index : 0;
  }, [cardId, cards]);

  const currentCard = useMemo(() => {
    if (!cards || cards.length === 0) return null;
    const card = cards[currentCardIndex] || null;
    console.log('CardEditor: Current card:', card?.id);
    return card;
  }, [cards, currentCardIndex]);

  // Initialize undo/redo system with current card elements
  const currentElements = useMemo(() => {
    if (!currentCard) return [];
    return currentSide === 'front' ? currentCard.front_elements || [] : currentCard.back_elements || [];
  }, [currentCard, currentSide]);

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState
  } = useUndoRedo(currentElements);

  // Save state when elements change (debounced to avoid too many saves)
  const saveElementsState = useCallback(() => {
    if (currentElements.length > 0) {
      saveState(currentElements);
    }
  }, [currentElements, saveState]);

  // PROTECTED: Initialize card editor state with protection
  const cardEditorState = useCardEditorState(currentCard);

  // Create element update handler with undo support
  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (!currentCard) return;

    console.log('🔧 CardEditor: Updating element', elementId, updates);

    // Save current state before making changes
    saveElementsState();

    const updateElementsArray = (elements: CanvasElement[]) => 
      elements.map(el => el.id === elementId ? { ...el, ...updates } : el);

    const frontElements = updateElementsArray(currentCard.front_elements || []);
    const backElements = updateElementsArray(currentCard.back_elements || []);

    const cardUpdates = {
      front_elements: frontElements,
      back_elements: backElements,
    };

    // Update cache immediately for instant UI response
    queryClient.setQueryData(['cards', actualSetId], (oldCards: Flashcard[] = []) => 
      oldCards.map(card => card.id === currentCard.id ? { ...card, ...cardUpdates } : card)
    );

    // Update database in background
    updateCard(cardUpdates);
  }, [currentCard, queryClient, actualSetId, saveElementsState]);

  // Create element delete handler with undo support
  const deleteElement = useCallback((elementId: string) => {
    if (!currentCard) return;

    console.log('🔧 CardEditor: Deleting element', elementId);

    // Save current state before making changes
    saveElementsState();

    const filterElements = (elements: CanvasElement[]) => 
      elements.filter(el => el.id !== elementId);

    const frontElements = filterElements(currentCard.front_elements || []);
    const backElements = filterElements(currentCard.back_elements || []);

    updateCard({
      front_elements: frontElements,
      back_elements: backElements,
    });
  }, [currentCard, saveElementsState]);

  // Undo handler
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState && currentCard) {
      console.log('🔧 CardEditor: Undoing to previous state', previousState);
      
      const cardUpdates = currentSide === 'front' 
        ? { front_elements: previousState }
        : { back_elements: previousState };

      // Update cache immediately
      queryClient.setQueryData(['cards', actualSetId], (oldCards: Flashcard[] = []) => 
        oldCards.map(card => card.id === currentCard.id ? { ...card, ...cardUpdates } : card)
      );

      // Update database
      updateCard(cardUpdates);
    }
  }, [undo, currentCard, currentSide, queryClient, actualSetId]);

  // Redo handler
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState && currentCard) {
      console.log('🔧 CardEditor: Redoing to next state', nextState);
      
      const cardUpdates = currentSide === 'front' 
        ? { front_elements: nextState }
        : { back_elements: nextState };

      // Update cache immediately
      queryClient.setQueryData(['cards', actualSetId], (oldCards: Flashcard[] = []) => 
        oldCards.map(card => card.id === currentCard.id ? { ...card, ...cardUpdates } : card)
      );

      // Update database
      updateCard(cardUpdates);
    }
  }, [redo, currentCard, currentSide, queryClient, actualSetId]);

  // Create canvas size update handler
  const updateCanvasSize = useCallback(async (width: number, height: number) => {
    console.log('🔧 CardEditor: Updating canvas size', width, height);
    await updateCard({ canvas_width: width, canvas_height: height });
  }, [updateCard]);

  // Create navigate card handler
  const navigateCard = useCallback((direction: 'prev' | 'next') => {
    console.log('🔧 CardEditor: Navigating card', direction);
    if (direction === 'next' && currentCardIndex < (cards?.length || 0) - 1) {
      // Navigate to next card - would need router navigation
    } else if (direction === 'prev' && currentCardIndex > 0) {
      // Navigate to prev card - would need router navigation
    }
  }, [currentCardIndex, cards?.length]);

  // Create a proper handler for element selection
  const handleElementSelect = useCallback((elementId: string | null) => {
    if (elementId && currentCard) {
      const element = currentSide === 'front' 
        ? currentCard.front_elements.find(el => el.id === elementId)
        : currentCard.back_elements.find(el => el.id === elementId);
      setSelectedElement(element || null);
    } else {
      setSelectedElement(null);
    }
  }, [currentCard, currentSide]);

  const handlers = useCardEditorHandlers({
    updateElement,
    deleteElement,
    setSelectedElementId: handleElementSelect,
    setCurrentCardIndex: (index: number) => {
      // TODO: Implement card index navigation
    },
    cards: cards || [],
    currentCard: currentCard!,
    navigateCard: () => {}, // Will be handled by the handlers
    setCurrentSide,
    currentSide,
    updateCard,
    updateCanvasSize,
    isTextSelecting: false,
    set: set,
    setDeckName: (name: string) => {
      // TODO: Implement deck name setting
    },
    selectedElementId: selectedElement?.id || null,
    setId: actualSetId!,
    cardId: cardId!,
  });

  // Enhanced auto arrange handler that respects the toggle
  const handleAutoArrangeWithToggle = useCallback((type: 'grid' | 'center' | 'stack' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-right' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit' | 'align-elements-center' | 'justify' | 'align-left' | 'align-center' | 'align-right') => {
    if (!cardEditorState.autoAlign) {
      console.log('🔧 Auto-align is disabled, skipping arrangement');
      return;
    }
    
    // Save state before auto-arranging
    saveElementsState();
    
    // Call the original handler if auto-align is enabled
    handlers.handleAutoArrange(type);
  }, [cardEditorState.autoAlign, handlers, saveElementsState]);

  // PROTECTION: Use ref to track initialization and prevent resets
  const protectedVisualStateRef = React.useRef({
    showGrid: false,
    snapToGrid: false,
    showBorder: false,
  });

  // Update protected ref when state changes
  React.useEffect(() => {
    protectedVisualStateRef.current = {
      showGrid: cardEditorState.showGrid,
      snapToGrid: cardEditorState.snapToGrid,
      showBorder: cardEditorState.showBorder,
    };
  }, [cardEditorState.showGrid, cardEditorState.snapToGrid, cardEditorState.showBorder]);

  // Log card editor state for debugging
  useEffect(() => {
    if (currentCard) {
      console.log('🔧 PROTECTION: CardEditor render with protected state:', {
        showGrid: protectedVisualStateRef.current.showGrid,
        snapToGrid: protectedVisualStateRef.current.snapToGrid,
        showBorder: protectedVisualStateRef.current.showBorder,
      });
    }
  }, [currentCard, currentCardIndex, cards?.length, set?.title]);

  const {
    isCollaborative,
    collaborators,
    activeUsers,
    enableCollaboration,
    removeCollaborator,
  } = useCollaborativeEditing({ setId: actualSetId, cardId });

  if (isCardsLoading || isSetLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (setQueryError || cardsQueryError) {
    console.error('CardEditor: Query errors:', { setQueryError, cardsQueryError });
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error Loading Editor</h2>
          <p className="text-muted-foreground">
            {setQueryError?.message || cardsQueryError?.message || 'Failed to load the card editor'}
          </p>
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Set not found</h2>
          <p className="text-muted-foreground">The set you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Show empty state if no cards exist
  if (!cards || cards.length === 0) {
    return (
      <CardEditorLayout
        cards={[]}
        currentCard={null}
        currentCardIndex={0}
        currentSide={currentSide}
        selectedElement={selectedElement}
        deckName={set.title}
        cardWidth={600}
        cardHeight={400}
        zoom={cardEditorState.zoom}
        
        // PROTECTED: Use protected visual editor state including auto-align
        showGrid={cardEditorState.showGrid}
        snapToGrid={cardEditorState.snapToGrid}
        showBorder={cardEditorState.showBorder}
        autoAlign={cardEditorState.autoAlign}
        onShowGridChange={cardEditorState.setShowGrid}
        onSnapToGridChange={cardEditorState.setSnapToGrid}
        onShowBorderChange={cardEditorState.setShowBorder}
        onAutoAlignChange={cardEditorState.setAutoAlign}
        
        toolbarPosition={cardEditorState.toolbarPosition}
        toolbarIsDocked={cardEditorState.toolbarIsDocked}
        toolbarShowText={cardEditorState.toolbarShowText}
        isPanning={cardEditorState.isPanning}
        showCardOverview={cardEditorState.showCardOverview}
        
        // Connect all handlers properly
        onZoomChange={cardEditorState.setZoom}
        onToolbarPositionChange={cardEditorState.setToolbarPosition}
        onToolbarDockChange={cardEditorState.setToolbarIsDocked}
        onToolbarShowTextChange={cardEditorState.setToolbarShowText}
        onShowCardOverviewChange={cardEditorState.setShowCardOverview}
        onDeckTitleChange={handlers.handleUpdateDeckTitle}
        onCardSideChange={handlers.handleCardSideChange}
        onElementSelect={handleElementSelect}
        onUpdateElement={handlers.handleUpdateElement}
        onDeleteElement={handlers.handleDeleteElement}
        onCanvasSizeChange={handlers.handleCanvasSizeChange}
        onUpdateCard={handlers.handleCardUpdate}
        onAddElement={handlers.handleAddElement}
        onAutoArrange={handleAutoArrangeWithToggle}
        onNavigateCard={handlers.handleNavigateCard}
        onCreateNewCard={handlers.handleCreateNewCard}
        onCreateNewCardWithLayout={handlers.handleCreateNewCardWithLayout}
        onCreateNewCardFromTemplate={handlers.handleCreateNewCardFromTemplate}
        onDeleteCard={handlers.handleDeleteCard}
        onFitToView={() => {}} // Will be handled by CardEditorLayout
        onOpenFullscreen={() => {}} // Will be handled by CardEditorLayout
        isCollaborative={isCollaborative}
        collaborators={collaborators}
        activeUsers={activeUsers}
        currentCardId={currentCard?.id}
        onEnableCollaboration={enableCollaboration}
        onRemoveCollaborator={removeCollaborator}
        showEmptyState={true}
      />
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Card not found</h2>
          <p className="text-muted-foreground">The card you're looking for doesn't exist in this set.</p>
        </div>
      </div>
    );
  }

  return (
    <CardEditorLayout
      cards={cards}
      currentCard={currentCard}
      currentCardIndex={currentCardIndex}
      currentSide={currentSide}
      selectedElement={selectedElement}
      deckName={set.title}
      cardWidth={currentCard.canvas_width}
      cardHeight={currentCard.canvas_height}
      zoom={cardEditorState.zoom}
      
      // PROTECTED: Use protected visual editor state including auto-align
      showGrid={cardEditorState.showGrid}
      snapToGrid={cardEditorState.snapToGrid}
      showBorder={cardEditorState.showBorder}
      autoAlign={cardEditorState.autoAlign}
      onShowGridChange={cardEditorState.setShowGrid}
      onSnapToGridChange={cardEditorState.setSnapToGrid}
      onShowBorderChange={cardEditorState.setShowBorder}
      onAutoAlignChange={cardEditorState.setAutoAlign}
      
      toolbarPosition={cardEditorState.toolbarPosition}
      toolbarIsDocked={cardEditorState.toolbarIsDocked}
      toolbarShowText={cardEditorState.toolbarShowText}
      isPanning={cardEditorState.isPanning}
      showCardOverview={cardEditorState.showCardOverview}
      
      // Connect all handlers properly
      onZoomChange={cardEditorState.setZoom}
      onToolbarPositionChange={cardEditorState.setToolbarPosition}
      onToolbarDockChange={cardEditorState.setToolbarIsDocked}
      onToolbarShowTextChange={cardEditorState.setToolbarShowText}
      onShowCardOverviewChange={cardEditorState.setShowCardOverview}
      onDeckTitleChange={handlers.handleUpdateDeckTitle}
      onCardSideChange={handlers.handleCardSideChange}
      onElementSelect={handleElementSelect}
      onUpdateElement={handlers.handleUpdateElement}
      onDeleteElement={handlers.handleDeleteElement}
      onCanvasSizeChange={handlers.handleCanvasSizeChange}
      onUpdateCard={handlers.handleCardUpdate}
      onAddElement={handlers.handleAddElement}
      onAutoArrange={handleAutoArrangeWithToggle}
      onNavigateCard={handlers.handleNavigateCard}
      onCreateNewCard={handlers.handleCreateNewCard}
      onCreateNewCardWithLayout={handlers.handleCreateNewCardWithLayout}
      onCreateNewCardFromTemplate={handlers.handleCreateNewCardFromTemplate}
      onDeleteCard={handlers.handleDeleteCard}
      onFitToView={() => {}} // Will be handled by CardEditorLayout
      onOpenFullscreen={() => {}} // Will be handled by CardEditorLayout
      onUndo={canUndo ? handleUndo : undefined}
      onRedo={canRedo ? handleRedo : undefined}
      canUndo={canUndo}
      canRedo={canRedo}
      isCollaborative={isCollaborative}
      collaborators={collaborators}
      activeUsers={activeUsers}
      currentCardId={currentCard?.id}
      onEnableCollaboration={enableCollaboration}
      onRemoveCollaborator={removeCollaborator}
    />
  );
};
