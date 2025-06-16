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
    updateUserPosition,
  } = useCollaborativeEditing({
    setId: setId || '',
    cardId: cardId || '',
  });

  // Computed values and helper functions
  const currentCard = cards[currentCardIndex];
  const selectedElement = selectedElementId 
    ? currentCard?.[currentSide === 'front' ? 'front_elements' : 'back_elements']?.find(el => el.id === selectedElementId)
    : null;

  // Helper function to transform database cards to Flashcard type
  const transformDatabaseCard = (card: any): Flashcard => ({
    id: card.id,
    set_id: card.set_id,
    question: card.question || '',
    answer: card.answer || '',
    hint: card.hint,
    front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
    back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
    card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
    interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null,
    password: card.password,
    countdown_timer: card.countdown_timer || 0,
    countdown_timer_front: card.countdown_timer_front || 0,
    countdown_timer_back: card.countdown_timer_back || 0,
    countdown_behavior_front: (card.countdown_behavior_front as 'flip' | 'next') || 'flip',
    countdown_behavior_back: (card.countdown_behavior_back as 'flip' | 'next') || 'next',
    flips_before_next: card.flips_before_next || 0,
    canvas_width: card.canvas_width || 600,
    canvas_height: card.canvas_height || 400,
    created_at: card.created_at,
    updated_at: card.updated_at,
    last_reviewed_at: card.last_reviewed_at,
    metadata: typeof card.metadata === 'object' && card.metadata !== null 
      ? card.metadata as { tags?: string[]; aiTags?: string[]; [key: string]: any; }
      : { tags: [], aiTags: [] },
    templateId: (card as any).templateId,
    allowedElementTypes: (card as any).allowedElementTypes || ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
    restrictedToolbar: (card as any).restrictedToolbar || false,
    showBackSide: (card as any).showBackSide !== false,
    autoAdvanceOnAnswer: (card as any).autoAdvanceOnAnswer || false,
    constraints: [],
  });

  // Initialize editor
  const initializeEditor = useCallback(async (setId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      
      // Transform set data to match FlashcardSet interface
      const transformedSet: FlashcardSet = {
        id: setData.id,
        title: setData.title,
        description: setData.description,
        user_id: setData.user_id,
        organization_id: setData.organization_id,
        is_collaborative: setData.is_collaborative,
        collaboration_settings: typeof setData.collaboration_settings === 'object' && setData.collaboration_settings !== null
          ? setData.collaboration_settings as { allowEditors: boolean; allowViewers: boolean; requireApproval: boolean; }
          : { allowEditors: true, allowViewers: true, requireApproval: false },
        permanent_shuffle: setData.permanent_shuffle,
        created_at: setData.created_at,
        updated_at: setData.updated_at,
      };
      
      setSet(transformedSet);

      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (cardsError) throw cardsError;

      const transformedCards: Flashcard[] = (cardsData || []).map(transformDatabaseCard);
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
  }, [user, toast, cardId]);

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
          front_elements: card.front_elements as any,
          back_elements: card.back_elements as any,
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

  // Add element to the current card
  const addElement = useCallback((type: string, x?: number, y?: number) => {
    if (!currentCard) return;

    const newElement: CanvasElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      x: x || 100,
      y: y || 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 40 : 150,
      content: type === 'text' ? 'Double-click to edit' : '',
      zIndex: 0,
    };

    const updatedCard = {
      ...currentCard,
      [currentSide === 'front' ? 'front_elements' : 'back_elements']: [
        ...(currentCard[currentSide === 'front' ? 'front_elements' : 'back_elements'] || []),
        newElement
      ]
    };

    setCards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    saveCard(updatedCard);
    setSelectedElementId(newElement.id);
  }, [currentCard, currentSide, saveCard]);

  // Update an element in the current card
  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    if (!currentCard) return;

    const updatedCard = {
      ...currentCard,
      [currentSide === 'front' ? 'front_elements' : 'back_elements']: 
        currentCard[currentSide === 'front' ? 'front_elements' : 'back_elements'].map(el =>
          el.id === elementId ? { ...el, ...updates } : el
        )
    };

    setCards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    saveCard(updatedCard);
  }, [currentCard, currentSide, saveCard]);

  // Delete an element from the current card
  const deleteElement = useCallback((elementId: string) => {
    if (!currentCard) return;

    const updatedCard = {
      ...currentCard,
      [currentSide === 'front' ? 'front_elements' : 'back_elements']: 
        currentCard[currentSide === 'front' ? 'front_elements' : 'back_elements'].filter(el => el.id !== elementId)
    };

    setCards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    saveCard(updatedCard);
    setSelectedElementId(null);
  }, [currentCard, currentSide, saveCard]);

  // Create a new card
  const createNewCard = useCallback(async () => {
    if (!setId || !user) return;

    const newCard = {
      set_id: setId,
      question: 'New Card',
      answer: 'Answer',
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

      const fullCard = transformDatabaseCard(data);
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

  // Create a new card from a template
  const createNewCardFromTemplate = useCallback(async (template: CardTemplate) => {
    if (!setId || !user) return;

    const newCard = {
      set_id: setId,
      question: '',
      answer: '',
      hint: '',
      front_elements: template.front_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })) as any,
      back_elements: template.back_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })) as any,
      card_type: template.card_type,
      interactive_type: null,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      countdown_timer: 0,
      countdown_timer_front: template.countdown_timer_front || 0,
      countdown_timer_back: template.countdown_timer_back || 0,
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

      const fullCard = transformDatabaseCard(data);
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

  // Create a new card with a layout from the current card
  const createNewCardWithLayout = useCallback(async () => {
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

      const createdCard = transformDatabaseCard(data);
      const newCardIndex = cards.length;

      setCards(prevCards => [...prevCards, createdCard]);
      setCurrentCardIndex(newCardIndex);
      setSelectedElementId(null);
      setCurrentSide('front');
      
      console.log('Set current card index to:', newCardIndex);
    } catch (error) {
      console.error('Error creating new card with layout:', error);
    }
  }, [setId, cards, currentCardIndex]);

  // Delete a card
  const deleteCard = useCallback(async (cardId: string) => {
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

      const cardIndex = cards.findIndex(card => card.id === cardId);
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));

      if (cardIndex <= currentCardIndex && currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      } else if (cardIndex === currentCardIndex && currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(Math.max(0, cards.length - 2));
      }

      setSelectedElementId(null);
      console.log('Card deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  }, [cards, currentCardIndex]);

  // Reorder cards
  const reorderCards = useCallback(async (reorderedCards: Flashcard[]) => {
    setCards(reorderedCards);
    
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
  }, []);

  // Update canvas size
  const updateCanvasSize = useCallback(async (width: number, height: number) => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    try {
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === currentCard.id 
            ? { ...card, canvas_width: width, canvas_height: height }
            : card
        )
      );

      await updateCard({ 
        canvas_width: width, 
        canvas_height: height 
      });

      console.log('Canvas size updated:', width, height);
    } catch (error) {
      console.error('Error updating canvas size:', error);
    }
  }, [cards, currentCardIndex]);

  // Helper function to update card metadata - fixed signature
  const updateCard = useCallback((updates: Partial<Flashcard>) => {
    if (!currentCard) return;

    const updatedCard = { ...currentCard, ...updates };
    setCards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    saveCard(updatedCard);
  }, [currentCard, saveCard]);

  // Navigate to the next or previous card
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
    if (setId) {
      initializeEditor(setId);
    }
  }, [setId, initializeEditor]);

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
    setCurrentCardIndex,
    initializeEditor,
    saveCard,
    updateCard,
    addElement,
    updateElement,
    deleteElement,
    updateCanvasSize,
    createNewCard,
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
    navigateCard,
    enableCollaboration,
    removeCollaborator,
    broadcastCursorPosition: () => {},
    broadcastElementSelection: () => {},
  };
};
