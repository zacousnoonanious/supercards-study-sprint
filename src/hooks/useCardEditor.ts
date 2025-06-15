import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, Flashcard, CanvasElement, CardTemplate } from '@/types/flashcard';

export const useCardEditor = () => {
  const { cardId } = useParams(); // Only get cardId from params, setId comes from props
  const navigate = useNavigate();
  const { user } = useAuth();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUrlUpdating, setIsUrlUpdating] = useState(false);
  const [setId, setSetId] = useState<string | null>(null);

  // Accept setId as a parameter to this hook
  const initializeEditor = useCallback(async (providedSetId: string) => {
    if (!user || !providedSetId) {
      setLoading(false);
      return;
    }

    console.log('useCardEditor: Initializing editor with setId:', providedSetId);
    setSetId(providedSetId);
    setLoading(true);

    try {
      // Fetch set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', providedSetId)
        .single();

      if (setError) {
        console.error('useCardEditor: Error fetching set:', setError);
        throw setError;
      }
      
      console.log('useCardEditor: Set fetched successfully:', setData);
      
      // Transform set data to match FlashcardSet interface
      const transformedSet: FlashcardSet = {
        ...setData,
        permanent_shuffle: setData.permanent_shuffle ?? false,
        description: setData.description ?? '',
        collaboration_settings: typeof setData.collaboration_settings === 'object' && setData.collaboration_settings !== null 
          ? setData.collaboration_settings as { allowEditors: boolean; allowViewers: boolean; requireApproval: boolean; }
          : { allowEditors: true, allowViewers: true, requireApproval: false }
      };
      setSet(transformedSet);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', providedSetId)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('useCardEditor: Error fetching cards:', cardsError);
        throw cardsError;
      }
      
      console.log('useCardEditor: Cards fetched successfully:', cardsData?.length || 0, 'cards');
      
      // Type cast the data to match our Flashcard interface
      const typedCards: Flashcard[] = (cardsData || []).map((card, index) => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        card_type: (card.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: (card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') || null,
        countdown_timer: card.countdown_timer || 0,
        countdown_timer_front: card.countdown_timer_front || 0,
        countdown_timer_back: card.countdown_timer_back || 0,
        countdown_behavior_front: (card.countdown_behavior_front as 'flip' | 'next') || 'flip',
        countdown_behavior_back: (card.countdown_behavior_back as 'flip' | 'next') || 'next',
        flips_before_next: card.flips_before_next || 2,
        password: card.password || null,
        position: index,
        countdown_behavior: ((card as any).countdown_behavior as 'flip' | 'next') || 'flip'
      }));
      
      setCards(typedCards);

      // If a specific cardId is provided, find and navigate to that card
      if (cardId && typedCards.length > 0) {
        const cardIndex = typedCards.findIndex(card => card.id === cardId);
        if (cardIndex >= 0) {
          console.log('useCardEditor: Setting card index to:', cardIndex);
          setCurrentCardIndex(cardIndex);
        } else {
          // Card not found, redirect to first card
          if (typedCards[0]) {
            console.log('useCardEditor: Card not found, redirecting to first card');
            navigate(`/editor/${providedSetId}/${typedCards[0].id}`, { replace: true });
          }
        }
      } else if (typedCards.length > 0) {
        // No specific card requested, go to first card
        console.log('useCardEditor: No card specified, setting to first card');
        setCurrentCardIndex(0);
      }
    } catch (error) {
      console.error('useCardEditor: Error initializing editor:', error);
    } finally {
      setLoading(false);
    }
  }, [user, cardId, navigate]);

  // Update URL when card index changes - only when not already updating
  useEffect(() => {
    if (cards.length > 0 && cards[currentCardIndex] && !isUrlUpdating && setId) {
      const currentCard = cards[currentCardIndex];
      if (currentCard && currentCard.id !== cardId) {
        setIsUrlUpdating(true);
        navigate(`/editor/${setId}/${currentCard.id}`, { replace: true });
        
        // Reset the flag after navigation
        setTimeout(() => {
          setIsUrlUpdating(false);
        }, 100);
      }
    }
  }, [currentCardIndex, cards, setId, navigate, cardId, isUrlUpdating]);

  const saveCard = async () => {
    if (!setId || cards.length === 0) return;

    try {
      const currentCard = cards[currentCardIndex];
      console.log('useCardEditor: Saving card:', currentCard.id);
      
      const { error } = await supabase
        .from('flashcards')
        .update({
          question: currentCard.question,
          answer: currentCard.answer,
          hint: currentCard.hint,
          front_elements: currentCard.front_elements as any,
          back_elements: currentCard.back_elements as any,
          card_type: currentCard.card_type,
          countdown_timer: currentCard.countdown_timer,
          countdown_timer_front: currentCard.countdown_timer_front,
          countdown_timer_back: currentCard.countdown_timer_back,
          countdown_behavior_front: currentCard.countdown_behavior_front,
          countdown_behavior_back: currentCard.countdown_behavior_back,
          flips_before_next: currentCard.flips_before_next,
          password: currentCard.password,
          canvas_width: currentCard.canvas_width,
          canvas_height: currentCard.canvas_height,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCard.id);

      if (error) throw error;
      console.log('useCardEditor: Card saved successfully');
    } catch (error) {
      console.error('useCardEditor: Error saving card:', error);
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Flashcard>) => {
    try {
      console.log('useCardEditor: Updating card:', cardId, 'with updates:', Object.keys(updates));
      
      // Prepare the update data for Supabase
      const updateData: any = {};
      
      if (updates.question !== undefined) updateData.question = updates.question;
      if (updates.answer !== undefined) updateData.answer = updates.answer;
      if (updates.hint !== undefined) updateData.hint = updates.hint;
      if (updates.card_type !== undefined) updateData.card_type = updates.card_type;
      if (updates.countdown_timer !== undefined) updateData.countdown_timer = updates.countdown_timer;
      if (updates.countdown_timer_front !== undefined) updateData.countdown_timer_front = updates.countdown_timer_front;
      if (updates.countdown_timer_back !== undefined) updateData.countdown_timer_back = updates.countdown_timer_back;
      if (updates.countdown_behavior_front !== undefined) updateData.countdown_behavior_front = updates.countdown_behavior_front;
      if (updates.countdown_behavior_back !== undefined) updateData.countdown_behavior_back = updates.countdown_behavior_back;
      if (updates.flips_before_next !== undefined) updateData.flips_before_next = updates.flips_before_next;
      if (updates.password !== undefined) updateData.password = updates.password;
      if (updates.front_elements !== undefined) updateData.front_elements = updates.front_elements as any;
      if (updates.back_elements !== undefined) updateData.back_elements = updates.back_elements as any;
      if (updates.canvas_width !== undefined) updateData.canvas_width = updates.canvas_width;
      if (updates.canvas_height !== undefined) updateData.canvas_height = updates.canvas_height;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('flashcards')
        .update(updateData)
        .eq('id', cardId);

      if (error) throw error;

      // Update local state
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      );

      console.log('useCardEditor: Card updated successfully in database');
    } catch (error) {
      console.error('useCardEditor: Error updating card:', error);
    }
  };

  const addElement = (type: string) => {
    if (!setId || cards.length === 0) return;

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: type as CanvasElement['type'],
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : type === 'image' ? 300 : type === 'drawing' ? 400 : 250,
      height: type === 'text' ? 100 : type === 'image' ? 200 : type === 'drawing' ? 300 : 150,
      rotation: 0,
      zIndex: 0,
      content: type === 'text' ? 'Double-click to edit' : type === 'multiple-choice' ? 'What is your question?' : type === 'true-false' ? 'True or False statement' : '',
      fontSize: type === 'text' ? 16 : undefined,
      color: type === 'text' ? '#000000' : undefined,
      fontWeight: type === 'text' ? 'normal' : undefined,
      fontStyle: type === 'text' ? 'normal' : undefined,
      textDecoration: type === 'text' ? 'none' : undefined,
      textAlign: type === 'text' ? 'center' : undefined,
      multipleChoiceOptions: type === 'multiple-choice' ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : undefined,
      correctAnswer: type === 'multiple-choice' || type === 'true-false' ? 0 : undefined,
      strokeColor: type === 'drawing' ? '#000000' : undefined,
      strokeWidth: type === 'drawing' ? 2 : undefined,
    };

    updateElement(newElement.id, newElement);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    console.log('useCardEditor: Updating element:', elementId, 'with updates:', Object.keys(updates));
    
    setCards(prevCards => {
      const newCards = [...prevCards];
      const currentCard = newCards[currentCardIndex];
      
      if (currentSide === 'front') {
        const elementIndex = currentCard.front_elements.findIndex(el => el.id === elementId);
        if (elementIndex >= 0) {
          currentCard.front_elements[elementIndex] = { ...currentCard.front_elements[elementIndex], ...updates };
        } else {
          currentCard.front_elements.push({ ...updates } as CanvasElement);
        }
      } else {
        const elementIndex = currentCard.back_elements.findIndex(el => el.id === elementId);
        if (elementIndex >= 0) {
          currentCard.back_elements[elementIndex] = { ...currentCard.back_elements[elementIndex], ...updates };
        } else {
          currentCard.back_elements.push({ ...updates } as CanvasElement);
        }
      }
      
      return newCards;
    });

    // Auto-save the card after element update
    setTimeout(() => {
      saveCard();
    }, 500);
  };

  const deleteElement = (elementId: string) => {
    setCards(prevCards => {
      const newCards = [...prevCards];
      const currentCard = newCards[currentCardIndex];
      
      if (currentSide === 'front') {
        currentCard.front_elements = currentCard.front_elements.filter(el => el.id !== elementId);
      } else {
        currentCard.back_elements = currentCard.back_elements.filter(el => el.id !== elementId);
      }
      
      return newCards;
    });
    
    setSelectedElement(null);
  };

  const navigateCard = useCallback((direction: 'prev' | 'next') => {
    console.log('Navigation requested:', direction, 'current index:', currentCardIndex);
    
    // Clear any selected element when navigating
    setSelectedElement(null);
    
    let newIndex = currentCardIndex;
    if (direction === 'prev' && currentCardIndex > 0) {
      newIndex = currentCardIndex - 1;
    } else if (direction === 'next' && currentCardIndex < cards.length - 1) {
      newIndex = currentCardIndex + 1;
    }
    
    if (newIndex !== currentCardIndex) {
      console.log('Setting new card index:', newIndex);
      setCurrentCardIndex(newIndex);
    }
  }, [currentCardIndex, cards.length]);

  const createNewCard = async () => {
    if (!setId) {
      console.error('No setId available for creating new card');
      return;
    }

    console.log('Creating new card for setId:', setId);

    const newCard = {
      question: 'New Card',
      answer: 'Answer',
      hint: '',
      front_elements: [] as any,
      back_elements: [] as any,
      set_id: setId,
      card_type: 'normal' as const,
      countdown_timer: 0,
      canvas_width: 600,
      canvas_height: 450,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(newCard)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Card created successfully:', data);

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
        position: cards.length, // Set position to current array length
        countdown_behavior: ((data as any).countdown_behavior as 'flip' | 'next') || 'flip'
      };

      const newCardIndex = cards.length;
      setCards(prevCards => [...prevCards, createdCard]);
      setCurrentCardIndex(newCardIndex);
      setSelectedElement(null);
      setCurrentSide('front');
      
      console.log('Set current card index to:', newCardIndex);
    } catch (error) {
      console.error('Error creating new card:', error);
    }
  };

  const createNewCardFromTemplate = async (template: CardTemplate) => {
    if (!setId) {
      console.error('No setId available for creating new card from template');
      return;
    }

    console.log('Creating new card from template:', template.name);

    // Generate new IDs for all elements
    const newFrontElements = template.front_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    
    const newBackElements = template.back_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));

    const newCard = {
      question: template.front_elements.find(el => el.type === 'text')?.content || 'New Card',
      answer: template.back_elements.find(el => el.type === 'text')?.content || 'Answer',
      hint: '',
      front_elements: newFrontElements as any,
      back_elements: newBackElements as any,
      set_id: setId,
      card_type: template.card_type,
      countdown_timer: 0,
      canvas_width: template.canvas_width || 600,
      canvas_height: template.canvas_height || 450,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(newCard)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Card created from template successfully:', data);

      const createdCard: Flashcard = {
        ...data,
        front_elements: data.front_elements as unknown as CanvasElement[] || [],
        back_elements: data.back_elements as unknown as CanvasElement[] || [],
        hint: data.hint || '',
        last_reviewed_at: data.last_reviewed_at || null,
        card_type: (data.card_type === 'standard' ? 'normal' : data.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: (data.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') || null,
        countdown_timer: data.countdown_timer || 0,
        countdown_timer_front: data.countdown_timer_front || 0,
        countdown_timer_back: data.countdown_timer_back || 0,
        countdown_behavior_front: (data.countdown_behavior_front as 'flip' | 'next') || 'flip',
        countdown_behavior_back: (data.countdown_behavior_back as 'flip' | 'next') || 'next',
        flips_before_next: data.flips_before_next || 2,
        password: data.password || null,
        position: cards.length, // Set position to current array length
        countdown_behavior: ((data as any).countdown_behavior as 'flip' | 'next') || 'flip'
      };

      const newCardIndex = cards.length;
      setCards(prevCards => [...prevCards, createdCard]);
      setCurrentCardIndex(newCardIndex);
      setSelectedElement(null);
      setCurrentSide('front');
      
      console.log('Set current card index to:', newCardIndex);
    } catch (error) {
      console.error('Error creating new card from template:', error);
    }
  };

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
        position: cards.length, // Set position to current array length
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

  return {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElement,
    loading,
    setCurrentSide,
    setSelectedElement,
    setCurrentCardIndex,
    saveCard,
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
