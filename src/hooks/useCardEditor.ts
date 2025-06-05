
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, Flashcard, CanvasElement } from '@/types/flashcard';

export const useCardEditor = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !setId) {
      setLoading(false);
      return;
    }

    const fetchSetAndCards = async () => {
      try {
        // Fetch set details
        const { data: setData, error: setError } = await supabase
          .from('flashcard_sets')
          .select('*')
          .eq('id', setId)
          .single();

        if (setError) throw setError;
        
        setSet(setData);

        // Fetch cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', setId)
          .order('created_at', { ascending: true });

        if (cardsError) throw cardsError;
        
        // Type cast the data to match our Flashcard interface
        const typedCards: Flashcard[] = (cardsData || []).map(card => ({
          ...card,
          front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
          back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
          hint: card.hint || '',
          last_reviewed_at: card.last_reviewed_at || null
        }));
        
        setCards(typedCards);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSetAndCards();
  }, [user, setId]);

  const saveCard = async () => {
    if (!setId || cards.length === 0) return;

    try {
      const currentCard = cards[currentCardIndex];
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
          password: currentCard.password,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCard.id);

      if (error) throw error;
      console.log('Card saved successfully');
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Flashcard>) => {
    try {
      // Prepare the update data for Supabase
      const updateData: any = {};
      
      if (updates.question !== undefined) updateData.question = updates.question;
      if (updates.answer !== undefined) updateData.answer = updates.answer;
      if (updates.hint !== undefined) updateData.hint = updates.hint;
      if (updates.card_type !== undefined) updateData.card_type = updates.card_type;
      if (updates.countdown_timer !== undefined) updateData.countdown_timer = updates.countdown_timer;
      if (updates.password !== undefined) updateData.password = updates.password;
      if (updates.front_elements !== undefined) updateData.front_elements = updates.front_elements as any;
      if (updates.back_elements !== undefined) updateData.back_elements = updates.back_elements as any;
      
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

      console.log('Card updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
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

  const navigateCard = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else if (direction === 'next' && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    setSelectedElement(null);
  };

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
      card_type: 'standard' as const,
      countdown_timer: 0,
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
        last_reviewed_at: data.last_reviewed_at || null
      };

      setCards(prevCards => {
        const newCards = [...prevCards, createdCard];
        console.log('Updated cards array:', newCards);
        return newCards;
      });
      
      setCurrentCardIndex(cards.length);
      setSelectedElement(null);
      console.log('Set current card index to:', cards.length);
    } catch (error) {
      console.error('Error creating new card:', error);
    }
  };

  const createNewCardWithLayout = async () => {
    if (!setId || cards.length === 0) return;

    const currentCard = cards[currentCardIndex];
    const newCard = {
      question: 'New Card',
      answer: 'Answer', 
      hint: '',
      front_elements: currentCard.front_elements.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        content: el.type === 'text' ? 'Double-click to edit' : el.content,
      })) as any,
      back_elements: currentCard.back_elements.map(el => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        content: el.type === 'text' ? 'Double-click to edit' : el.content,
      })) as any,
      set_id: setId,
      card_type: currentCard.card_type,
      countdown_timer: currentCard.countdown_timer,
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
        last_reviewed_at: data.last_reviewed_at || null
      };

      setCards(prevCards => [...prevCards, createdCard]);
      setCurrentCardIndex(cards.length);
      setSelectedElement(null);
    } catch (error) {
      console.error('Error creating new card with layout:', error);
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
    saveCard,
    addElement,
    updateElement,
    updateCard,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardWithLayout,
  };
};
