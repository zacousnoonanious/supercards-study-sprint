
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flashcard, FlashcardSet, CanvasElement } from '@/types/flashcard';

export const useCardEditor = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
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

  useEffect(() => {
    // Set initial card index from URL parameter if provided
    const cardParam = searchParams.get('card');
    if (cardParam) {
      const cardIndex = parseInt(cardParam, 10);
      if (!isNaN(cardIndex) && cardIndex >= 0) {
        setCurrentCardIndex(cardIndex);
      }
    }
  }, [searchParams, cards.length]);

  const fetchSetAndCards = async () => {
    try {
      console.log('Fetching set and cards for setId:', setId);
      
      // Fetch set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) {
        console.error('Set fetch error:', setError);
        throw setError;
      }
      
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
      console.log('Set data loaded:', setData);

      // Fetch cards with front_elements and back_elements
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('Cards fetch error:', cardsError);
        throw cardsError;
      }
      
      // Transform the data to match our Flashcard type
      const initializedCards: Flashcard[] = cardsData?.map(card => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : []
      })) || [];
      
      setCards(initializedCards);
      console.log('Cards loaded:', initializedCards.length, 'cards');
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

    console.log('Creating new card for setId:', setId);

    const defaultFrontElement: CanvasElement = {
      id: `front-text-${Date.now()}`,
      type: 'text',
      x: 150,
      y: 180,
      width: 300,
      height: 60,
      rotation: 0,
      content: 'Front side text',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center'
    };

    const defaultBackElement: CanvasElement = {
      id: `back-text-${Date.now()}`,
      type: 'text',
      x: 150,
      y: 180,
      width: 300,
      height: 60,
      rotation: 0,
      content: 'Back side text',
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center'
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
    console.log('Saving card:', card.id);
    
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

  const addElement = (type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'youtube' | 'deck-embed') => {
    console.log('Adding element of type:', type);
    
    const getElementDefaults = (elementType: typeof type): CanvasElement => {
      const baseDefaults = {
        id: `element-${Date.now()}`,
        type: elementType,
        rotation: 0,
      };

      switch (elementType) {
        case 'text':
          return {
            ...baseDefaults,
            type: 'text' as const,
            x: 150,
            y: 180,
            width: 300,
            height: 60,
            content: 'Edit this text',
            fontSize: 20,
            color: '#000000',
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            textDecoration: 'none' as const,
            textAlign: 'center' as const,
          };
        case 'image':
          return {
            ...baseDefaults,
            type: 'image' as const,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            imageUrl: '/placeholder.svg',
          };
        case 'multiple-choice':
          return {
            ...baseDefaults,
            type: 'multiple-choice' as const,
            x: 50,
            y: 50,
            width: 350,
            height: 200,
            content: 'Which option is correct?',
            multipleChoiceOptions: ['Option 1', 'Option 2', 'Option 3'],
            correctAnswer: 0,
          };
        case 'true-false':
          return {
            ...baseDefaults,
            type: 'true-false' as const,
            x: 50,
            y: 50,
            width: 300,
            height: 150,
            content: 'This statement is true.',
            correctAnswer: 1,
          };
        case 'youtube':
          return {
            ...baseDefaults,
            type: 'youtube' as const,
            x: 50,
            y: 50,
            width: 400,
            height: 225,
            youtubeUrl: '',
            autoplay: false,
          };
        case 'deck-embed':
          return {
            ...baseDefaults,
            type: 'deck-embed' as const,
            x: 50,
            y: 50,
            width: 300,
            height: 200,
            deckId: '',
            deckTitle: '',
          };
        default:
          // This should never happen, but TypeScript requires it
          return {
            ...baseDefaults,
            type: 'text' as const,
            x: 150,
            y: 180,
            width: 300,
            height: 60,
            content: 'Edit this text',
            fontSize: 20,
            color: '#000000',
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            textDecoration: 'none' as const,
            textAlign: 'center' as const,
          };
      }
    };

    const newElement = getElementDefaults(type);

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
    console.log('Updating element:', elementId, 'with updates:', updates);
    
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
    console.log('Deleting element:', elementId);
    
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
    console.log('Navigating card:', direction);
    
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
