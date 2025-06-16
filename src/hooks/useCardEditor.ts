import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard, CanvasElement, FlashcardSet, CardTemplate } from '@/types/flashcard';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';

export const useCardEditor = () => {
  const { setId, cardId } = useParams<{ setId: string; cardId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Collaborative editing setup
  const {
    collaborators,
    activeUsers,
    isCollaborative,
    enableCollaboration,
    removeCollaborator,
    broadcastCursorPosition,
    broadcastElementSelection,
  } = useCollaborativeEditing(setId || '', cardId || '');

  // Computed values and helper functions
  const currentCard = cards[currentCardIndex];
  const selectedElement = selectedElementId 
    ? currentCard?.[currentSide === 'front' ? 'front_elements' : 'back_elements']?.find(el => el.id === selectedElementId)
    : null;

  // Fetch functions with proper metadata handling
  const fetchSetAndCards = useCallback(async () => {
    if (!setId || !user) return;

    try {
      setLoading(true);
      
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setSet(setData);

      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (cardsError) throw cardsError;

      const transformedCards: Flashcard[] = (cardsData || []).map(card => ({
        id: card.id,
        set_id: card.set_id,
        question: card.question || '',
        answer: card.answer || '',
        hint: card.hint,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as CanvasElement[] : [],
        card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
        interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null,
        password: card.password,
        countdown_timer: card.countdown_timer,
        countdown_timer_front: card.countdown_timer_front,
        countdown_timer_back: card.countdown_timer_back,
        countdown_behavior_front: card.countdown_behavior_front,
        countdown_behavior_back: card.countdown_behavior_back,
        flips_before_next: card.flips_before_next,
        canvas_width: card.canvas_width || 600,
        canvas_height: card.canvas_height || 400,
        created_at: card.created_at,
        updated_at: card.updated_at,
        last_reviewed_at: card.last_reviewed_at,
        metadata: typeof card.metadata === 'object' && card.metadata !== null 
          ? card.metadata as { tags?: string[]; aiTags?: string[]; [key: string]: any; }
          : { tags: [], aiTags: [] },
        templateId: card.templateId,
        allowedElementTypes: card.allowedElementTypes || ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
        restrictedToolbar: card.restrictedToolbar || false,
        showBackSide: card.showBackSide !== false,
        autoAdvanceOnAnswer: card.autoAdvanceOnAnswer || false,
      }));

      setCards(transformedCards);

      if (cardId) {
        const cardIndex = transformedCards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          setCurrentCardIndex(cardIndex);
        }
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [setId, cardId, user, toast]);

  // Save functions and other methods
  const saveCard = useCallback(async (card: Flashcard) => {
    if (!user || saving) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('flashcards')
        .update({
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          front_elements: card.front_elements,
          back_elements: card.back_elements,
          card_type: card.card_type,
          interactive_type: card.interactive_type,
          password: card.password,
          countdown_timer: card.countdown_timer,
          countdown_timer_front: card.countdown_timer_front,
          countdown_timer_back: card.countdown_timer_back,
          countdown_behavior_front: card.countdown_behavior_front,
          countdown_behavior_back: card.countdown_behavior_back,
          flips_before_next: card.flips_before_next,
          canvas_width: card.canvas_width,
          canvas_height: card.canvas_height,
          metadata: card.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', card.id);

      if (error) throw error;

      console.log('Card saved successfully');
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: "Failed to save card",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [user, saving, toast]);

  const createNewCard = useCallback(async () => {
    if (!setId || !user) return;

    const newCard: Partial<Flashcard> = {
      set_id: setId,
      question: '',
      answer: '',
      hint: '',
      front_elements: [],
      back_elements: [],
      card_type: 'normal',
      interactive_type: null,
      canvas_width: 600,
      canvas_height: 400,
      countdown_timer: 0,
      countdown_timer_front: 0,
      countdown_timer_back: 0,
      countdown_behavior_front: 'flip',
      countdown_behavior_back: 'next',
      flips_before_next: 2,
      metadata: { tags: [], aiTags: [] },
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;

      const fullCard = {
        ...data,
        front_elements: data.front_elements || [],
        back_elements: data.back_elements || [],
        metadata: data.metadata || { tags: [], aiTags: [] },
      } as Flashcard;

      setCards(prev => [...prev, fullCard]);
      setCurrentCardIndex(cards.length);
      navigate(`/edit/${setId}/${data.id}`);

      toast({
        title: "Success",
        description: "New card created",
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: "Error", 
        description: "Failed to create card",
        variant: "destructive"
      });
    }
  }, [setId, user, cards.length, navigate, toast]);

  const createNewCardFromTemplate = useCallback(async (template: CardTemplate) => {
    if (!setId || !user) return;

    const newCard: Partial<Flashcard> = {
      set_id: setId,
      question: '',
      answer: '',
      hint: '',
      front_elements: template.front_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      back_elements: template.back_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      card_type: template.card_type,
      interactive_type: null,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      countdown_timer: 0,
      countdown_timer_front: template.countdown_timer_front || 0,
      countdown_timer_back: template.countdown_timer_back || 0,
      countdown_behavior_front: template.countdown_behavior_front || 'flip',
      countdown_behavior_back: template.countdown_behavior_back || 'next',
      flips_before_next: 2,
      metadata: { tags: [], aiTags: [] },
      templateId: template.id,
      allowedElementTypes: template.allowedElementTypes,
      restrictedToolbar: template.restrictedToolbar,
      showBackSide: template.showBackSide,
      autoAdvanceOnAnswer: template.autoAdvanceOnAnswer,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;

      const fullCard = {
        ...data,
        front_elements: data.front_elements || [],
        back_elements: data.back_elements || [],
        metadata: data.metadata || { tags: [], aiTags: [] },
      } as Flashcard;

      setCards(prev => [...prev, fullCard]);
      setCurrentCardIndex(cards.length);
      navigate(`/edit/${setId}/${data.id}`);

      toast({
        title: "Success",
        description: "New card created from template",
      });
    } catch (error) {
      console.error('Error creating card from template:', error);
      toast({
        title: "Error",
        description: "Failed to create card from template", 
        variant: "destructive"
      });
    }
  }, [setId, user, cards.length, navigate, toast]);

  const createNewCardWithLayout = async () => {
    if (!setId || cards.length === 0) return;

    const currentCard = cards[currentCardIndex];
    
    // Copy all elements from both front and back sides with new IDs
    const newFrontElements = currentCard.front_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: el.type === 'text' ? 'Double-click to edit' : el.content,
    }));
    
    const newBackElements = currentCard.back_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: el.type === 'text' ? 'Double-click to edit' : el.content,
    }));
    
    const newCard = {
      question: 'New Card',
      answer: 'Answer', 
      hint: '',
      front_elements: newFrontElements as any,
      back_elements: newBackElements as any,
      set_id: setId,
      card_type: currentCard.card_type,
      countdown_timer: currentCard.countdown_timer,
      canvas_width: currentCard.canvas_width || 600,
      canvas_height: currentCard.canvas_height || 450,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(newCard)
        .select()
        .single();

      if (error) throw error;

      const createdCard: Flashcard = {
        ...data,
        front_elements: data.front_elements as unknown as CanvasElement[] || [],
        back_elements: data.back_elements as unknown as CanvasElement[] || [],
        hint: data.hint || '',
        last_reviewed_at: data.last_reviewed_at || null,
        card_type: (data.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: (data.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') || null,
        countdown_timer: data.countdown_timer || 0,
        countdown_timer_front: data.countdown_timer_front || 0,
        countdown_timer_back: data.countdown_timer_back || 0,
        countdown_behavior_front: (data.countdown_behavior_front as 'flip' | 'next') || 'flip',
        countdown_behavior_back: (data.countdown_behavior_back as 'flip' | 'next') || 'next',
        flips_before_next: data.flips_before_next || 2,
        password: data.password || null,
        countdown_behavior: ((data as any).countdown_behavior as 'flip' | 'next') || 'flip'
      };

      // Calculate the new index before updating state
      const newCardIndex = cards.length;

      // Add the card to state and navigate to it
      setCards(prevCards => [...prevCards, createdCard]);
      
      // Navigate to the new card using the pre-calculated index
      setCurrentCardIndex(newCardIndex);
      setSelectedElement(null);
      setCurrentSide('front');
      
      console.log('Set current card index to:', newCardIndex);
    } catch (error) {
      console.error('Error creating new card with layout:', error);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (cards.length <= 1) {
      console.log('Cannot delete the last card');
      return false;
    }

    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      // Remove card from local state
      const cardIndex = cards.findIndex(card => card.id === cardId);
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));

      // Adjust current card index if necessary
      if (cardIndex <= currentCardIndex && currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      } else if (cardIndex === currentCardIndex && currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(Math.max(0, cards.length - 2));
      }

      setSelectedElement(null);
      console.log('Card deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  };

  const reorderCards = async (reorderedCards: Flashcard[]) => {
    setCards(reorderedCards);
    
    // Update the order in the database by updating each card with a new position or timestamp
    try {
      const updates = reorderedCards.map((card, index) => 
        supabase
          .from('flashcards')
          .update({ updated_at: new Date(Date.now() + index).toISOString() })
          .eq('id', card.id)
      );
      
      await Promise.all(updates);
      console.log('Cards reordered successfully');
    } catch (error) {
      console.error('Error reordering cards:', error);
    }
  };

  // New function to handle canvas size changes
  const updateCanvasSize = async (width: number, height: number) => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    try {
      // Update local state immediately for responsive UI
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === currentCard.id 
            ? { ...card, canvas_width: width, canvas_height: height }
            : card
        )
      );

      // Update database
      await updateCard(currentCard.id, { 
        canvas_width: width, 
        canvas_height: height 
      });

      console.log('Canvas size updated:', width, height);
    } catch (error) {
      console.error('Error updating canvas size:', error);
    }
  };

  // Helper function to update card metadata
  const updateCard = useCallback((updates: Partial<Flashcard>) => {
    if (!currentCard) return;

    const updatedCard = { ...currentCard, ...updates };
    setCards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    saveCard(updatedCard);
  }, [currentCard, saveCard]);

  const navigateCard = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCardIndex > 0) {
      const prevCard = cards[currentCardIndex - 1];
      setCurrentCardIndex(currentCardIndex - 1);
      navigate(`/edit/${setId}/${prevCard.id}`);
    } else if (direction === 'next' && currentCardIndex < cards.length - 1) {
      const nextCard = cards[currentCardIndex + 1];
      setCurrentCardIndex(currentCardIndex + 1);
      navigate(`/edit/${setId}/${nextCard.id}`);
    }
  }, [currentCardIndex, cards, setId, navigate]);

  useEffect(() => {
    fetchSetAndCards();
  }, [fetchSetAndCards]);

  useEffect(() => {
    if (cardId && cards.length > 0) {
      const cardIndex = cards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1 && cardIndex !== currentCardIndex) {
        setCurrentCardIndex(cardIndex);
      }
    }
  }, [cardId, cards, currentCardIndex]);

  return {
    // State
    set,
    cards,
    currentCard,
    currentCardIndex,
    currentSide,
    selectedElement,
    selectedElementId,
    loading,
    saving,
    
    // Collaboration
    collaborators,
    activeUsers,
    isCollaborative,
    
    // Methods
    setCurrentSide,
    setSelectedElementId,
    fetchSetAndCards,
    saveCard,
    updateCard,
    createNewCard,
    createNewCardFromTemplate,
    navigateCard,
    enableCollaboration,
    removeCollaborator,
    broadcastCursorPosition,
    broadcastElementSelection,
  };
};
