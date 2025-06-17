
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { useCardEditorState } from '@/hooks/useCardEditorState';
import { useCardEditorHandlers } from '@/hooks/useCardEditorHandlers';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { CardEditorLayout } from './CardEditorLayout';
import { LoadingSkeletons } from './LoadingSkeletons';

interface CardEditorProps {}

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
      return data.map(card => ({
        ...card,
        front_elements: card.front_elements || [],
        back_elements: card.back_elements || [],
        allowedElementTypes: ['text', 'image', 'audio', 'drawing', 'youtube', 'video', 'iframe', 'embedded-deck', 'multiple-choice', 'true-false', 'fill-in-blank', 'tts'],
        restrictedToolbar: false,
        showBackSide: true,
        autoAdvanceOnAnswer: false,
        constraints: [],
        order: 0
      })) as Flashcard[];
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

  const {
    onDeckTitleChange,
    onCardSideChange,
    onElementSelect,
    onUpdateElement,
    onDeleteElement,
    onCanvasSizeChange,
    onUpdateCard,
    onAddElement,
    onAutoArrange,
    onNavigateCard,
    onCreateNewCard,
    onCreateNewCardWithLayout,
    onCreateNewCardFromTemplate,
    onDeleteCard,
    onZoomChange,
    onToolbarPositionChange,
    onToolbarDockChange,
    onToolbarShowTextChange,
    onShowCardOverviewChange,
    onFitToView,
    onOpenFullscreen,
  } = useCardEditorHandlers({
    setId,
    cardId,
    currentCard,
    currentCardIndex,
    cards,
    set,
    queryClient,
    currentSide,
    setCurrentSide,
    selectedElement,
    setSelectedElement,
  });

  if (isCardsLoading || isSetLoading) {
    return <LoadingSkeletons />;
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
      onZoomChange={onZoomChange}
      onToolbarPositionChange={onToolbarPositionChange}
      onToolbarDockChange={onToolbarDockChange}
      onToolbarShowTextChange={onToolbarShowTextChange}
      onShowCardOverviewChange={onShowCardOverviewChange}
      onDeckTitleChange={onDeckTitleChange}
      onCardSideChange={onCardSideChange}
      onElementSelect={onElementSelect}
      onUpdateElement={onUpdateElement}
      onDeleteElement={onDeleteElement}
      onCanvasSizeChange={onCanvasSizeChange}
      onUpdateCard={onUpdateCard}
      onAddElement={onAddElement}
      onAutoArrange={onAutoArrange}
      onNavigateCard={onNavigateCard}
      onCreateNewCard={onCreateNewCard}
      onCreateNewCardWithLayout={onCreateNewCardWithLayout}
      onCreateNewCardFromTemplate={onCreateNewCardFromTemplate}
      onDeleteCard={onDeleteCard}
      onFitToView={onFitToView}
      onOpenFullscreen={onOpenFullscreen}
      isCollaborative={isCollaborative}
      collaborators={collaborators}
      activeUsers={activeUsers}
      currentCardId={currentCard?.id}
      onEnableCollaboration={enableCollaboration}
      onRemoveCollaborator={removeCollaborator}
    />
  );
};
