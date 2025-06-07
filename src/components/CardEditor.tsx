
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, Flashcard, CanvasElement } from '@/types/flashcard';
import { PowerPointEditor } from './PowerPointEditor';
import { LockableToolbar } from './LockableToolbar';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { useToast } from '@/hooks/use-toast';

export const CardEditor: React.FC = () => {
  const { setId, cardId } = useParams<{ setId: string; cardId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [cardDimensions, setCardDimensions] = useState({ width: 600, height: 400 });

  // Fetch set data
  const { data: set, isLoading: setLoading } = useQuery({
    queryKey: ['flashcard-set', setId],
    queryFn: async () => {
      if (!setId) throw new Error('Set ID is required');
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          flashcards (*)
        `)
        .eq('id', setId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our types
      const transformedSet: FlashcardSet = {
        ...data,
        flashcards: data.flashcards.map((card: any) => ({
          ...card,
          front_elements: Array.isArray(card.front_elements) ? card.front_elements : [],
          back_elements: Array.isArray(card.back_elements) ? card.back_elements : [],
          canvas_width: card.canvas_width || 600,
          canvas_height: card.canvas_height || 400,
        }))
      };
      
      return transformedSet;
    },
    enabled: !!setId,
  });

  // Update card dimensions when set data changes
  useEffect(() => {
    if (set?.flashcards?.[currentCardIndex]) {
      const currentCard = set.flashcards[currentCardIndex];
      setCardDimensions({
        width: currentCard.canvas_width || 600,
        height: currentCard.canvas_height || 400
      });
    }
  }, [set, currentCardIndex]);

  // Find current card index when cardId changes
  useEffect(() => {
    if (set?.flashcards && cardId) {
      const index = set.flashcards.findIndex(card => card.id === cardId);
      if (index !== -1) {
        setCurrentCardIndex(index);
      }
    }
  }, [set?.flashcards, cardId]);

  // Mutation for updating cards
  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, updates }: { cardId: string; updates: Partial<Flashcard> }) => {
      // Convert CanvasElement arrays to JSON for database storage
      const dbUpdates: any = { ...updates };
      if (updates.front_elements) {
        dbUpdates.front_elements = updates.front_elements as any;
      }
      if (updates.back_elements) {
        dbUpdates.back_elements = updates.back_elements as any;
      }
      
      const { error } = await supabase
        .from('flashcards')
        .update(dbUpdates)
        .eq('id', cardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update card",
        variant: "destructive",
      });
      console.error('Update error:', error);
    },
  });

  // Mutation for creating new cards
  const createCardMutation = useMutation({
    mutationFn: async () => {
      if (!setId) throw new Error('Set ID is required');
      
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: 'New Card',
          answer: '',
          front_elements: [],
          back_elements: [],
          canvas_width: cardDimensions.width,
          canvas_height: cardDimensions.height,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newCard) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      navigate(`/sets/${setId}/cards/${newCard.id}`);
      toast({
        title: "Success",
        description: "New card created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create new card",
        variant: "destructive",
      });
      console.error('Create error:', error);
    },
  });

  // Mutation for deleting cards
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-set', setId] });
      toast({
        title: "Success",
        description: "Card deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    },
  });

  const currentCard = set?.flashcards?.[currentCardIndex];
  const currentElements = currentSide === 'front' 
    ? (currentCard?.front_elements as CanvasElement[] || [])
    : (currentCard?.back_elements as CanvasElement[] || []);

  const handleUpdateCard = useCallback((cardId: string, updates: Partial<Flashcard>) => {
    updateCardMutation.mutate({ cardId, updates });
  }, [updateCardMutation]);

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (!currentCard) return;

    const elementField = currentSide === 'front' ? 'front_elements' : 'back_elements';
    const elements = currentElements;
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );

    handleUpdateCard(currentCard.id, { [elementField]: updatedElements });
  }, [currentCard, currentSide, currentElements, handleUpdateCard]);

  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    if (!currentCard) return;

    const newElement: CanvasElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 300,
      height: type === 'text' ? 60 : 200,
      content: type === 'text' ? 'New Text' : '',
      zIndex: currentElements.length + 1,
    };

    const elementField = currentSide === 'front' ? 'front_elements' : 'back_elements';
    const updatedElements = [...currentElements, newElement];
    
    handleUpdateCard(currentCard.id, { [elementField]: updatedElements });
    setSelectedElementId(newElement.id);
  }, [currentCard, currentSide, currentElements, handleUpdateCard]);

  const handleDeleteElement = useCallback((elementId: string) => {
    if (!currentCard) return;

    const elementField = currentSide === 'front' ? 'front_elements' : 'back_elements';
    const updatedElements = currentElements.filter(el => el.id !== elementId);
    
    handleUpdateCard(currentCard.id, { [elementField]: updatedElements });
    setSelectedElementId(null);
  }, [currentCard, currentSide, currentElements, handleUpdateCard]);

  const handleNavigateCard = useCallback((direction: 'prev' | 'next') => {
    if (!set?.flashcards) return;

    const newIndex = direction === 'prev' 
      ? Math.max(0, currentCardIndex - 1)
      : Math.min(set.flashcards.length - 1, currentCardIndex + 1);
    
    if (newIndex !== currentCardIndex) {
      const newCard = set.flashcards[newIndex];
      navigate(`/sets/${setId}/cards/${newCard.id}`);
    }
  }, [set?.flashcards, currentCardIndex, setId, navigate]);

  const handleCreateNewCard = useCallback(() => {
    createCardMutation.mutate();
  }, [createCardMutation]);

  const handleDeleteCard = useCallback(() => {
    if (!currentCard || !set?.flashcards) return;

    if (set.flashcards.length === 1) {
      toast({
        title: "Cannot delete",
        description: "Cannot delete the last card in the set",
        variant: "destructive",
      });
      return;
    }

    deleteCardMutation.mutate(currentCard.id);
    
    // Navigate to a different card
    const newIndex = currentCardIndex > 0 ? currentCardIndex - 1 : 0;
    const remainingCards = set.flashcards.filter(card => card.id !== currentCard.id);
    if (remainingCards[newIndex]) {
      navigate(`/sets/${setId}/cards/${remainingCards[newIndex].id}`);
    }
  }, [currentCard, set?.flashcards, currentCardIndex, deleteCardMutation, navigate, setId, toast]);

  const handleAutoArrange = useCallback((type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'scale-to-fit') => {
    if (!currentCard || currentElements.length === 0) return;

    let updatedElements = [...currentElements];

    switch (type) {
      case 'scale-to-fit':
        if (selectedElementId) {
          updatedElements = updatedElements.map(el => 
            el.id === selectedElementId 
              ? { ...el, width: cardDimensions.width, height: cardDimensions.height, x: 0, y: 0 }
              : el
          );
        }
        break;
      case 'center':
        updatedElements = updatedElements.map(el => ({
          ...el,
          x: (cardDimensions.width - el.width) / 2,
          y: (cardDimensions.height - el.height) / 2,
        }));
        break;
      case 'grid':
        const cols = Math.ceil(Math.sqrt(updatedElements.length));
        const rows = Math.ceil(updatedElements.length / cols);
        const cellWidth = cardDimensions.width / cols;
        const cellHeight = cardDimensions.height / rows;
        
        updatedElements = updatedElements.map((el, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            ...el,
            x: col * cellWidth + 10,
            y: row * cellHeight + 10,
            width: cellWidth - 20,
            height: cellHeight - 20,
          };
        });
        break;
      // Add other arrangement types as needed
    }

    const elementField = currentSide === 'front' ? 'front_elements' : 'back_elements';
    handleUpdateCard(currentCard.id, { [elementField]: updatedElements });
  }, [currentCard, currentElements, selectedElementId, cardDimensions, currentSide, handleUpdateCard]);

  const handleCardDimensionsChange = useCallback((width: number, height: number) => {
    if (!currentCard) return;
    
    setCardDimensions({ width, height });
    handleUpdateCard(currentCard.id, { 
      canvas_width: width, 
      canvas_height: height 
    });
  }, [currentCard, handleUpdateCard]);

  const handleSave = useCallback(() => {
    toast({
      title: "Saved",
      description: "All changes have been saved automatically",
    });
  }, [toast]);

  if (setLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!set || !currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Card not found</div>
      </div>
    );
  }

  const selectedElement = currentElements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="h-screen flex flex-col">
      <LockableToolbar
        set={set}
        currentCard={currentCard}
        currentCardIndex={currentCardIndex}
        totalCards={set.flashcards.length}
        currentSide={currentSide}
        onAddElement={handleAddElement}
        onUpdateCard={handleUpdateCard}
        onNavigateCard={handleNavigateCard}
        onSideChange={setCurrentSide}
        onCreateNewCard={handleCreateNewCard}
        onCreateNewCardWithLayout={handleCreateNewCard}
        onDeleteCard={handleDeleteCard}
        onSave={handleSave}
        onAutoArrange={handleAutoArrange}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        cardDimensions={cardDimensions}
        onCardDimensionsChange={handleCardDimensionsChange}
      />

      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <PowerPointEditor
          elements={currentElements}
          onUpdateElement={handleUpdateElement}
          onAddElement={handleAddElement}
          onDeleteElement={handleDeleteElement}
          cardWidth={cardDimensions.width}
          cardHeight={cardDimensions.height}
          selectedElementId={selectedElementId}
          onElementSelect={setSelectedElementId}
          showGrid={showGrid}
        />
      </div>

      <SimpleEditorFooter
        currentCard={currentCard}
        selectedElement={selectedElement}
        onUpdateCard={handleUpdateCard}
        cardWidth={cardDimensions.width}
      />
    </div>
  );
};
