import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, Flashcard, CanvasElement } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Play, Edit, Plus, MoreVertical, Trash2, Brain, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { CardOverview } from '@/components/CardOverview';

const SetView = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardCreator, setShowCardCreator] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);

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
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        card_type: (card.card_type as Flashcard['card_type']) || 'standard',
        interactive_type: (card.interactive_type as Flashcard['interactive_type']) || null,
        countdown_timer: card.countdown_timer || 0,
        password: card.password || null
      }));
      
      setCards(typedCards);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const handleStudy = () => {
    navigate(`/study/${setId}`);
  };

  const handleAddCard = () => {
    setShowCardCreator(true);
  };

  const handleCardCreated = () => {
    fetchSetAndCards();
    setShowCardCreator(false);
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
    navigate(`/edit-cards/${setId}?card=${index}`);
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

  // Show card overview if requested
  if (showCardOverview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <CardOverview
          cards={cards}
          onReorderCards={reorderCards}
          onBackToEditor={() => setShowCardOverview(false)}
          onEditCard={handleCardClick}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Set Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{set?.title}</h1>
          {set?.description && (
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{set.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button onClick={handleStudy} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none min-w-0">
              <Play className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Study ({cards.length})</span>
            </Button>
            
            <Button onClick={handleVisualEditor} variant="outline" className="flex-1 sm:flex-none min-w-0">
              <Edit className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Visual Editor</span>
              <span className="sm:hidden">Editor</span>
            </Button>
            
            <Button onClick={() => setShowCardOverview(true)} variant="outline" className="flex-1 sm:flex-none min-w-0">
              <LayoutGrid className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Card Overview</span>
              <span className="sm:hidden">Overview</span>
            </Button>
            
            <Button onClick={handleAddCard} variant="outline" className="flex-1 sm:flex-none min-w-0">
              <Plus className="mr-1 sm:mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Card</span>
              <span className="sm:hidden">Add</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditSet}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Set
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowQuizGenerator(true)}>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteSet} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Interactive Card Creator Modal */}
        {showCardCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
              <InteractiveCardCreator
                setId={setId!}
                onCardCreated={handleCardCreated}
                onClose={() => setShowCardCreator(false)}
              />
            </div>
          </div>
        )}

        {/* Quiz Generator Modal */}
        {showQuizGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-lg">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Generate Quiz Cards</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuizGenerator(false)}
                  >
                    ✕
                  </Button>
                </div>
                <AIFlashcardGenerator 
                  setId={setId!} 
                  onGenerated={() => {
                    fetchCards();
                    setShowQuizGenerator(false);
                  }}
                  mode="generate-quiz"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* AI Flashcard Generator */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <AIFlashcardGenerator setId={setId!} onGenerated={fetchCards} />
          </div>

          {/* Cards Grid */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            {cards.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <div className="text-gray-500 mb-4 text-sm sm:text-base">No flashcards yet</div>
                  <div className="space-y-3">
                    <Button onClick={handleAddCard} className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Card
                    </Button>
                    <div className="text-xs sm:text-sm text-gray-400">or use the AI generator</div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {cards.map((card, index) => (
                  <Card 
                    key={card.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick(index)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs sm:text-sm text-gray-500">Card {index + 1}</span>
                          {card.card_type && card.card_type !== 'standard' && (
                            <span className="text-xs text-blue-600 font-medium capitalize">
                              {card.card_type.replace('-', ' ')}
                            </span>
                          )}
                          {card.interactive_type && (
                            <span className="text-xs text-green-600 font-medium capitalize">
                              {card.interactive_type.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            asChild 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                          <div className="text-xs sm:text-sm line-clamp-2 break-words">{card.question}</div>
                        </div>
                        {card.card_type !== 'single-sided' && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Back:</div>
                            <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">{card.answer}</div>
                          </div>
                        )}
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
