import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Play, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  created_at: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
}

const SetView = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (setId) {
      fetchSetAndCards();
    }
  }, [user, setId, navigate]);

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
      setCards(cardsData || []);
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

  const deleteCard = async (cardId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when deleting
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      
      setCards(cards.filter(card => card.id !== cardId));
      toast({
        title: "Success",
        description: "Flashcard deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (cardIndex: number) => {
    navigate(`/edit-cards/${setId}?card=${cardIndex}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Deck not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/decks')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Decks
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">{set.title}</h1>
                {set.description && (
                  <p className="text-sm text-gray-600">{set.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Navigation />
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate(`/edit-cards/${setId}`)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Visual Editor
                </Button>
                {cards.length > 0 && (
                  <Button onClick={() => navigate(`/study/${setId}`)}>
                    <Play className="w-4 h-4 mr-2" />
                    Study
                  </Button>
                )}
              </div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Flashcards ({cards.length})
          </h2>
          <Button onClick={() => navigate(`/edit-cards/${setId}`)}>
            <Palette className="w-4 h-4 mr-2" />
            Open Visual Editor
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
              <p className="text-gray-600 mb-4">Use the Visual Editor to create your first flashcard!</p>
              <Button onClick={() => navigate(`/edit-cards/${setId}`)}>
                <Palette className="w-4 h-4 mr-2" />
                Open Visual Editor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Card 
                key={card.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCardClick(index)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Question</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteCard(card.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">{card.question}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Answer:</p>
                    <p className="text-gray-800">{card.answer}</p>
                  </div>
                  {card.hint && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hint:</p>
                      <p className="text-gray-700 text-sm">{card.hint}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SetView;
