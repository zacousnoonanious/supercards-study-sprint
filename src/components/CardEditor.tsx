import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { CardEditorLayout } from './CardEditorLayout';
import { transformDatabaseCardToFlashcard } from '@/utils/cardTransforms';
import { updateFlashcard } from '@/lib/api/flashcards';
import { useToast } from '@/hooks/use-toast';

/**
 * CardEditor Component
 * 
 * Main card editor with PROTECTED visual editor state management.
 * CRITICAL: Visual editor features (grid, snap, border) are locally managed
 * and protected from external state resets.
 */
export const CardEditor: React.FC = () => {
  const { setId, cardId } = useParams<{ setId: string; cardId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  const {
    data: set,
    isLoading: isSetLoading,
    error: setQueryError,
  } = useQuery({
    queryKey: ['set', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (error) {
        console.error('Error fetching set:', error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!setId,
  });

  const {
    data: cards,
    isLoading: isCardsLoading,
    error: cardsQueryError,
  } = useQuery({
    queryKey: ['cards', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching cards:', error);
        throw new Error(error.message);
      }
      
      // Transform database rows to match Flashcard interface
      return data.map(card => transformDatabaseCardToFlashcard(card));
    },
    enabled: !!setId,
  });

  const currentCardIndex = useMemo(() => {
    if (!cardId || !cards) return 0;
    return cards.findIndex((card) => card.id === cardId);
  }, [cardId, cards]);

  const currentCard = useMemo(() => {
    if (!cards || cards.length === 0) return null;
    return cards[currentCardIndex] || null;
  }, [cards, currentCardIndex]);

  // PROTECTED: Initialize card editor state with protection
  const cardEditorState = useCardEditorState(currentCard);

  // Create element update handler
  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (!currentCard) return;

    console.log('🔧 CardEditor: Updating element', elementId, updates);

    const updateElementsArray = (elements: CanvasElement[]) => 
      elements.map(el => el.id === elementId ? { ...el, ...updates } : el);

    const frontElements = updateElementsArray(currentCard.front_elements || []);
    const backElements = updateElementsArray(currentCard.back_elements || []);

    const cardUpdates = {
      front_elements: frontElements,
      back_elements: backElements,
    };

    // Update cache immediately for instant UI response
    queryClient.setQueryData(['cards', setId], (oldCards: Flashcard[] = []) => 
      oldCards.map(card => card.id === currentCard.id ? { ...card, ...cardUpdates } : card)
    );

    // Update database in background
    updateCard(cardUpdates);
  }, [currentCard, queryClient, setId]);

  // Create element delete handler
  const deleteElement = useCallback((elementId: string) => {
    if (!currentCard) return;

    console.log('🔧 CardEditor: Deleting element', elementId);

    const filterElements = (elements: CanvasElement[]) => 
      elements.filter(el => el.id !== elementId);

    const frontElements = filterElements(currentCard.front_elements || []);
    const backElements = filterElements(currentCard.back_elements || []);

    updateCard({
      front_elements: frontElements,
      back_elements: backElements,
    });
  }, [currentCard]);

  // Create card update handler
  const updateCard = useCallback(async (updates: Partial<Flashcard>) => {
    if (!currentCard) return;

    try {
      console.log('🔧 CardEditor: Updating card', updates);
      
      // Update cache immediately for instant response
      queryClient.setQueryData(['cards', setId], (oldCards: Flashcard[] = []) => 
        oldCards.map(card => card.id === currentCard.id ? { ...card, ...updates } : card)
      );

      // Update database in background
      await updateFlashcard({ ...currentCard, ...updates });
      console.log('🔧 CardEditor: Card updated successfully');
    } catch (error) {
      console.error('🔧 CardEditor: Error updating card:', error);
      // Revert cache on error
      queryClient.invalidateQueries({ queryKey: ['cards', setId] });
      toast({
        title: 'Error',
        description: 'Failed to update card',
        variant: 'destructive',
      });
    }
  }, [currentCard, setId, queryClient, toast]);

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
    navigateCard,
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
    setId: setId!,
    cardId: cardId!,
  });

  // Enhanced auto arrange handler that respects the toggle
  const handleAutoArrangeWithToggle = useCallback((type: 'grid' | 'center' | 'stack' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-right' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit' | 'align-elements-center' | 'justify' | 'align-left' | 'align-center' | 'align-right') => {
    if (!cardEditorState.autoAlign) {
      console.log('🔧 Auto-align is disabled, skipping arrangement');
      return;
    }
    
    // Call the original handler if auto-align is enabled
    handlers.handleAutoArrange(type);
  }, [cardEditorState.autoAlign, handlers]);

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
  } = useCollaborativeEditing({ setId, cardId });

  if (isCardsLoading || isSetLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!set || !currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Card not found</h2>
          <p className="text-muted-foreground">The card you're looking for doesn't exist.</p>
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
      isCollaborative={isCollaborative}
      collaborators={collaborators}
      activeUsers={activeUsers}
      currentCardId={currentCard?.id}
      onEnableCollaboration={enableCollaboration}
      onRemoveCollaborator={removeCollaborator}
    />
  );
};
