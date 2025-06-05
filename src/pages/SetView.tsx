
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Play, Edit, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';

const SetView = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
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
        front_elements: Array.isArray(card.front_elements) ? card.front_elements : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements : [],
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

  const handleStudy = () => {
    navigate(`/study/${setId}`);
  };

  const handleAddCard = () => {
    navigate(`/add-card/${setId}`);
  };

  const handleEditSet = () => {
    navigate(`/edit-set/${setId}`);
  };

  const handleVisualEditor = () => {
    navigate(`/edit-cards/${setId}`);
  };

  const handleDeleteSet = async () => {
    if (!setId) return;

    if (window.confirm("Are you sure you want to delete this set? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('flashcard_sets')
          .delete()
          .eq('id', setId);

        if (error) throw error;

        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting set:', error);
      }
    }
  };

  const handleCardClick = (index: number) => {
    navigate(`/edit-card/${cards[index].id}`);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!setId) return;

    if (window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('flashcards')
          .delete()
          .eq('id', cardId);

        if (error) throw error;

        fetchSetAndCards(); // Refresh cards after deletion
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const fetchCards = () => {
    fetchSetAndCards();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Set not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Set Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{set.title}</h1>
          {set.description && (
            <p className="text-gray-600 mb-4">{set.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleStudy} className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" />
              Study ({cards.length} cards)
            </Button>
            
            <Button onClick={handleVisualEditor} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Visual Editor
            </Button>
            
            <Button onClick={handleAddCard} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleEditSet}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Set
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteSet} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AI Flashcard Generator */}
          <div className="lg:col-span-1">
            <AIFlashcardGenerator setId={setId!} onGenerated={fetchCards} />
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-2">
            {cards.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-500 mb-4">No flashcards yet</div>
                  <div className="space-y-2">
                    <Button onClick={handleAddCard} className="mr-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Card
                    </Button>
                    <div className="text-sm text-gray-400">or use the AI generator</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {cards.map((card, index) => (
                  <Card 
                    key={card.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">Card {index + 1}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            asChild 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(index);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Card
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Front:</div>
                          <div className="text-sm line-clamp-2">{card.question}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Back:</div>
                          <div className="text-sm text-gray-600 line-clamp-2">{card.answer}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetView;
