
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CardEditor } from '@/components/CardEditor';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/types/flashcard';

const CardEditorPage = () => {
  const { setId, cardId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [card, setCard] = useState<Flashcard | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (setId && cardId) {
      fetchCardAndSet();
    }
  }, [user, setId, cardId, navigate]);

  const fetchCardAndSet = async () => {
    try {
      // Fetch all cards in the set
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;

      const transformedCards: Flashcard[] = (cardsData || []).map((card, index) => ({
        ...card,
        front_elements: (card.front_elements as any) || [],
        back_elements: (card.back_elements as any) || [],
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        card_type: (card.card_type === 'standard' ? 'normal' : card.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: card.interactive_type || null,
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

      setCards(transformedCards);

      // Find the current card
      const currentCard = transformedCards.find(c => c.id === cardId);
      if (!currentCard) {
        toast({
          title: "Error",
          description: "Card not found",
          variant: "destructive"
        });
        navigate(`/sets/${setId}`);
        return;
      }

      setCard(currentCard);
    } catch (error) {
      console.error('Error fetching card:', error);
      toast({
        title: "Error",
        description: "Failed to load card",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Card not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CardEditor
        card={card}
        cards={cards}
        setId={setId!}
        onCardUpdated={fetchCardAndSet}
      />
    </div>
  );
};

export default CardEditorPage;
