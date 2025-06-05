
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flashcard, FlashcardSet, CanvasElement } from '@/types/flashcard';

export const useCardEditor = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !setId) return;
    fetchSetAndCards();
  }, [user, setId]);

  const fetchSetAndCards = async () => {
    try {
      // Fetch set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      
      // Check if user owns this set
      if (setData.user_id !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own flashcard sets.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
      
      setSet(setData);

      // Fetch cards with front_elements and back_elements
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;
      
      // Transform the data to match our Flashcard type
      const initializedCards: Flashcard[] = cardsData?.map(card => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : []
      })) || [];
      
      setCards(initializedCards);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcard set.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const createNewCard = async () => {
    if (!setId) return;

    const defaultFrontElement: CanvasElement = {
      id: `front-text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 100,
      width: 300,
      height: 60,
      rotation: 0,
      content: 'Front side text',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left'
    };

    const defaultBackElement: CanvasElement = {
      id: `back-text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 100,
      width: 300,
      height: 60,
      rotation: 0,
      content: 'Back side text',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left'
    };

    try {
      const { data: newCard, error } = await supabase
        .from('flashcards')
        .insert({
          set_id: setId,
          question: 'New Card',
          answer: 'Answer',
          front_elements: [defaultFrontElement] as any,
          back_elements: [defaultBackElement] as any
        })
        .select()
        .single();

      if (error) throw error;

      const formattedCard: Flashcard = {
        ...newCard,
        front_elements: [defaultFrontElement],
        back_elements: [defaultBackElement]
      };

      setCards([...cards, formattedCard]);
      setCurrentCardIndex(cards.length);
      
      toast({
        title: "Success",
        description: "New card created successfully.",
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: "Error",
        description: "Failed to create new card.",
        variant: "destructive",
      });
    }
  };

  const saveCard = async () => {
    if (!cards[currentCardIndex]) return;
    
    const card = cards[currentCardIndex];
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front_elements: card.front_elements as any,
          back_elements: card.back_elements as any
        })
        .eq('id', card.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Card saved successfully.",
      });
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: "Failed to save card.",
        variant: "destructive",
      });
    }
  };

  const addElement = (type: 'text' | 'image') => {
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 40 : 150,
      rotation: 0,
      content: type === 'text' ? 'Edit this text' : '',
      fontSize: type === 'text' ? 16 : undefined,
      color: type === 'text' ? '#000000' : undefined,
      fontWeight: type === 'text' ? 'normal' : undefined,
      fontStyle: type === 'text' ? 'normal' : undefined,
      textDecoration: type === 'text' ? 'none' : undefined,
      textAlign: type === 'text' ? 'left' : undefined,
      imageUrl: type === 'image' ? '/placeholder.svg' : undefined
    };

    const updatedCards = [...cards];
    if (currentSide === 'front') {
      updatedCards[currentCardIndex].front_elements.push(newElement);
    } else {
      updatedCards[currentCardIndex].back_elements.push(newElement);
    }
    setCards(updatedCards);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<CanvasElement>) => {
    const updatedCards = [...cards];
    const elements = currentSide === 'front' 
      ? updatedCards[currentCardIndex].front_elements 
      : updatedCards[currentCardIndex].back_elements;
    
    const elementIndex = elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      elements[elementIndex] = { ...elements[elementIndex], ...updates };
      setCards(updatedCards);
    }
  };

  const deleteElement = (elementId: string) => {
    const updatedCards = [...cards];
    if (currentSide === 'front') {
      updatedCards[currentCardIndex].front_elements = 
        updatedCards[currentCardIndex].front_elements.filter(el => el.id !== elementId);
    } else {
      updatedCards[currentCardIndex].back_elements = 
        updatedCards[currentCardIndex].back_elements.filter(el => el.id !== elementId);
    }
    setCards(updatedCards);
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
    deleteElement,
    navigateCard,
    createNewCard,
  };
};
