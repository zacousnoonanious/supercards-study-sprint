
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';
import { getFlashcardsBySetId, createFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/api/flashcards';

interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCardEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Core state
  const [setId, setSetId] = useState<string>('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Fetch set data
  const { data: set, isLoading: setLoading } = useQuery({
    queryKey: ['flashcard_set', setId],
    queryFn: async () => {
      if (!setId) return null;
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (error) throw error;
      return data as FlashcardSet;
    },
    enabled: !!setId && !!user,
  });

  // Fetch cards data using the API function that already transforms the data
  const { data: cards = [], isLoading: cardsLoading, refetch: refetchCards } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: () => getFlashcardsBySetId(setId),
    enabled: !!setId && !!user,
  });

  const loading = setLoading || cardsLoading;

  const currentCard = cards[currentCardIndex] || null;

  const initializeEditor = useCallback((newSetId: string) => {
    console.log('Initializing editor with setId:', newSetId);
    setSetId(newSetId);
    setCurrentCardIndex(0);
    setCurrentSide('front');
    setSelectedElementId(null);
  }, []);

  const addElement = useCallback((type: string, x?: number, y?: number) => {
    if (!currentCard) return;

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: type as any,
      x: x || 50,
      y: y || 50,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      zIndex: 0,
      content: type === 'text' ? 'New text' : '',
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: type === 'text' ? 'transparent' : '#ffffff',
    };

    const elements = currentSide === 'front' ? currentCard.front_elements || [] : currentCard.back_elements || [];
    const updatedElements = [...elements, newElement];

    const updates = currentSide === 'front' 
      ? { front_elements: updatedElements }
      : { back_elements: updatedElements };

    updateCard(updates);
    setSelectedElementId(newElement.id);
  }, [currentCard, currentSide]);

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (!currentCard) return;

    const updateElementsArray = (elements: CanvasElement[]) => 
      elements.map(el => el.id === elementId ? { ...el, ...updates } : el);

    const frontElements = updateElementsArray(currentCard.front_elements || []);
    const backElements = updateElementsArray(currentCard.back_elements || []);

    updateCard({
      front_elements: frontElements,
      back_elements: backElements,
    });
  }, [currentCard]);

  const updateCard = useCallback(async (updates: Partial<Flashcard>) => {
    if (!currentCard) return;

    try {
      const updatedCard = await updateFlashcard({ ...currentCard, ...updates });
      
      // Update local cache immediately
      queryClient.setQueryData(['flashcards', setId], (oldCards: Flashcard[] = []) => 
        oldCards.map(card => card.id === currentCard.id ? { ...card, ...updates } : card)
      );

      console.log('Card updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: t('error'),
        description: t('cardUpdateFailed'),
        variant: 'destructive',
      });
    }
  }, [currentCard, setId, queryClient, t, toast]);

  const updateCanvasSize = useCallback(async (width: number, height: number) => {
    await updateCard({ canvas_width: width, canvas_height: height });
  }, [updateCard]);

  const deleteElement = useCallback((elementId: string) => {
    if (!currentCard) return;

    const filterElements = (elements: CanvasElement[]) => 
      elements.filter(el => el.id !== elementId);

    const frontElements = filterElements(currentCard.front_elements || []);
    const backElements = filterElements(currentCard.back_elements || []);

    updateCard({
      front_elements: frontElements,
      back_elements: backElements,
    });

    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [currentCard, selectedElementId, updateCard]);

  const navigateCard = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
    setSelectedElementId(null);
  }, [currentCardIndex, cards.length]);

  const createNewCard = useCallback(async () => {
    if (!setId) return;

    try {
      const newCard = await createFlashcard({
        set_id: setId,
        question: 'New Card',
        answer: 'Answer',
        front_elements: [],
        back_elements: [],
        canvas_width: 600,
        canvas_height: 450,
      });

      refetchCards();
      setCurrentCardIndex(cards.length);
      setSelectedElementId(null);

      toast({
        title: t('success'),
        description: t('cardCreated'),
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: t('error'),
        description: t('cardCreationFailed'),
        variant: 'destructive',
      });
    }
  }, [setId, cards.length, refetchCards, t, toast]);

  const createNewCardFromTemplate = useCallback(async (template: CardTemplate) => {
    if (!setId) return;

    try {
      const newFrontElements = template.front_elements.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }));
      
      const newBackElements = template.back_elements.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }));

      const newCard = await createFlashcard({
        set_id: setId,
        question: template.front_elements.find(el => el.type === 'text')?.content || 'New Card',
        answer: template.back_elements.find(el => el.type === 'text')?.content || 'Answer',
        front_elements: newFrontElements as any,
        back_elements: newBackElements as any,
        canvas_width: template.canvas_width || 600,
        canvas_height: template.canvas_height || 450,
        card_type: template.card_type || 'normal',
      });

      refetchCards();
      setCurrentCardIndex(cards.length);
      setSelectedElementId(null);

      toast({
        title: t('success'),
        description: t('cardCreatedFromTemplate'),
      });
    } catch (error) {
      console.error('Error creating card from template:', error);
      toast({
        title: t('error'),
        description: t('cardCreationFailed'),
        variant: 'destructive',
      });
    }
  }, [setId, cards.length, refetchCards, t, toast]);

  const createNewCardWithLayout = useCallback(async () => {
    // Implementation for creating cards with specific layouts
    await createNewCard();
  }, [createNewCard]);

  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      await deleteFlashcard(cardId);
      
      const deletedIndex = cards.findIndex(card => card.id === cardId);
      if (deletedIndex !== -1 && currentCardIndex >= deletedIndex && currentCardIndex > 0) {
        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
      }
      
      refetchCards();
      setSelectedElementId(null);

      toast({
        title: t('success'),
        description: t('cardDeleted'),
      });

      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: t('error'),
        description: t('cardDeletionFailed'),
        variant: 'destructive',
      });
      return false;
    }
  }, [cards, currentCardIndex, refetchCards, t, toast]);

  const reorderCards = useCallback(async (reorderedCards: Flashcard[]) => {
    try {
      // Update cards order in the database
      const updates = reorderedCards.map((card, index) => 
        supabase
          .from('flashcards')
          .update({ updated_at: new Date(Date.now() + index).toISOString() })
          .eq('id', card.id)
      );
      
      await Promise.all(updates);
      refetchCards();
      
      toast({
        title: t('success'),
        description: t('cardsReordered'),
      });
    } catch (error) {
      console.error('Error reordering cards:', error);
      toast({
        title: t('error'),
        description: t('reorderFailed'),
        variant: 'destructive',
      });
    }
  }, [refetchCards, t, toast]);

  return {
    // Data
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElementId,
    loading,
    
    // Setters
    setCurrentSide,
    setSelectedElementId,
    setCurrentCardIndex,
    
    // Actions
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
  };
};
