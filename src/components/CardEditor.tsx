
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Save, RotateCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ElementToolbar } from './ElementToolbar';
import { CardCanvas } from './CardCanvas';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  front_elements: any[];
  back_elements: any[];
}

interface FlashcardSet {
  id: string;
  title: string;
  user_id: string;
}

export const CardEditor = () => {
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

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;
      
      // Initialize elements arrays if they don't exist
      const initializedCards = cardsData?.map(card => ({
        ...card,
        front_elements: card.front_elements || [],
        back_elements: card.back_elements || []
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

  const saveCard = async () => {
    if (!cards[currentCardIndex]) return;
    
    const card = cards[currentCardIndex];
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front_elements: card.front_elements,
          back_elements: card.back_elements
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
    const newElement = {
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

  const updateElement = (elementId: string, updates: any) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No cards found</div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
              <h1 className="text-xl font-bold text-indigo-600">
                Editing: {set.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={saveCard} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1">
            <ElementToolbar
              onAddElement={addElement}
              selectedElement={selectedElement ? currentElements.find(el => el.id === selectedElement) : null}
              onUpdateElement={(updates) => selectedElement && updateElement(selectedElement, updates)}
              onDeleteElement={() => selectedElement && deleteElement(selectedElement)}
            />
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateCard('prev')}
                      disabled={currentCardIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Card {currentCardIndex + 1} of {cards.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateCard('next')}
                      disabled={currentCardIndex === cards.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={currentSide === 'front' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentSide('front')}
                    >
                      Front
                    </Button>
                    <Button
                      variant={currentSide === 'back' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentSide('back')}
                    >
                      Back
                    </Button>
                  </div>
                </div>

                <CardCanvas
                  elements={currentElements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={updateElement}
                  cardSide={currentSide}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
