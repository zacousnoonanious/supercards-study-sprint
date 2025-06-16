import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { StudyCardRenderer } from './StudyCardRenderer';
import { StudyNavigationBar } from './StudyNavigationBar';
import { Flashcard, CanvasElement } from '@/types/flashcard';

interface EmbeddedDeckViewerProps {
  deckId: string;
  deckTitle?: string;
  cardCount?: number;
  onClose?: () => void;
}

export const EmbeddedDeckViewer: React.FC<EmbeddedDeckViewerProps> = ({
  deckId,
  deckTitle,
  cardCount,
  onClose,
}) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId || !user) return;

    const fetchCards = async () => {
      try {
        const { data: cardsData, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', deckId)
          .order('created_at');

        if (error) throw error;

        // Transform the cards data to match Flashcard interface
        const transformedCards: Flashcard[] = (cardsData || []).map(card => ({
          id: card.id,
          set_id: card.set_id,
          question: card.question,
          answer: card.answer,
          hint: card.hint,
          front_elements: (card.front_elements as unknown as CanvasElement[]) || [],
          back_elements: (card.back_elements as unknown as CanvasElement[]) || [],
          card_type: card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected',
          interactive_type: (card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') || null,
          password: card.password,
          countdown_timer: card.countdown_timer,
          countdown_timer_front: card.countdown_timer_front,
          countdown_timer_back: card.countdown_timer_back,
          countdown_behavior_front: card.countdown_behavior_front,
          countdown_behavior_back: card.countdown_behavior_back,
          flips_before_next: card.flips_before_next,
          canvas_width: card.canvas_width,
          canvas_height: card.canvas_height,
          metadata: typeof card.metadata === 'object' && card.metadata !== null 
            ? card.metadata as { tags?: string[]; aiTags?: string[]; [key: string]: any; }
            : { tags: [], aiTags: [] },
          created_at: card.created_at,
          updated_at: card.updated_at,
          last_reviewed_at: card.last_reviewed_at,
        }));
        
        setCards(transformedCards);
      } catch (error) {
        console.error('Error fetching embedded deck cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [deckId, user]);

  const currentCard = cards[currentCardIndex];

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    } else if (direction === 'next' && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="text-lg text-foreground">Loading deck...</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center p-8">
        <div className="text-lg text-foreground">No cards found in this deck</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h3 className="font-semibold">{deckTitle || 'Embedded Deck'}</h3>
            <p className="text-sm text-muted-foreground">
              {currentCardIndex + 1} of {cards.length} cards
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="flex justify-center mb-6">
          <div 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg"
            style={{ 
              width: `${currentCard.canvas_width || 600}px`,
              height: `${currentCard.canvas_height || 450}px`,
              maxWidth: '100%',
            }}
          >
            <StudyCardRenderer
              elements={showAnswer ? (currentCard.back_elements || []) : (currentCard.front_elements || [])}
              textScale={1}
              cardWidth={currentCard.canvas_width || 600}
              cardHeight={currentCard.canvas_height || 450}
              className="w-full h-full"
            />
          </div>
        </div>

        {currentCard.hint && !showAnswer && (
          <div className="text-sm text-muted-foreground flex justify-center mb-4">
            💡 {currentCard.hint}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t p-4">
        <StudyNavigationBar
          currentIndex={currentCardIndex}
          totalCards={cards.length}
          onNavigate={handleNavigate}
          onFlipCard={handleFlipCard}
          showAnswer={showAnswer}
          allowNavigation={true}
        />
      </div>
    </div>
  );
};
