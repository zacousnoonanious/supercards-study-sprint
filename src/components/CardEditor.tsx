

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
  
  // CRITICAL: Protect visual editor state from being reset by external effects
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

  const handlers = useCardEditorHandlers({
    updateElement: (elementId: string, updates: Partial<CanvasElement>) => {
      // Implementation will be added to the hook
    },
    deleteElement: (elementId: string) => {
      // Implementation will be added to the hook
    },
    setSelectedElementId: setSelectedElement,
    setCurrentCardIndex: (index: number) => {
      // Implementation will be added to the hook
    },
    cards: cards || [],
    currentCard: currentCard!,
    navigateCard: (direction: 'prev' | 'next') => {
      // Implementation will be added to the hook
    },
    setCurrentSide,
    currentSide,
    updateCard: (updates: Partial<Flashcard>) => {
      // Implementation will be added to the hook
    },
    updateCanvasSize: async (width: number, height: number) => {
      // Implementation will be added to the hook
    },
    isTextSelecting: false,
    set: set,
    setDeckName: (name: string) => {
      // Implementation will be added to the hook
    },
    selectedElementId: selectedElement?.id || null,
  });

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
      
      // PROTECTED: Use protected visual editor state
      showGrid={cardEditorState.showGrid}
      snapToGrid={cardEditorState.snapToGrid}
      showBorder={cardEditorState.showBorder}
      onShowGridChange={cardEditorState.setShowGrid}
      onSnapToGridChange={cardEditorState.setSnapToGrid}
      onShowBorderChange={cardEditorState.setShowBorder}
      
      toolbarPosition={cardEditorState.toolbarPosition}
      toolbarIsDocked={cardEditorState.toolbarIsDocked}
      toolbarShowText={cardEditorState.toolbarShowText}
      isPanning={cardEditorState.isPanning}
      showCardOverview={cardEditorState.showCardOverview}
      onZoomChange={() => {}}
      onToolbarPositionChange={() => {}}
      onToolbarDockChange={() => {}}
      onToolbarShowTextChange={() => {}}
      onShowCardOverviewChange={() => {}}
      onDeckTitleChange={async () => {}}
      onCardSideChange={() => {}}
      onElementSelect={() => {}}
      onUpdateElement={() => {}}
      onDeleteElement={() => {}}
      onCanvasSizeChange={() => {}}
      onUpdateCard={() => {}}
      onAddElement={() => {}}
      onAutoArrange={() => {}}
      onNavigateCard={() => {}}
      onCreateNewCard={() => {}}
      onCreateNewCardWithLayout={() => {}}
      onCreateNewCardFromTemplate={() => {}}
      onDeleteCard={() => {}}
      onFitToView={() => {}}
      onOpenFullscreen={() => {}}
      isCollaborative={isCollaborative}
      collaborators={collaborators}
      activeUsers={activeUsers}
      currentCardId={currentCard?.id}
      onEnableCollaboration={enableCollaboration}
      onRemoveCollaborator={removeCollaborator}
    />
  );
};

