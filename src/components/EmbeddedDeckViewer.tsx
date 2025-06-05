
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StudyCardRenderer } from './StudyCardRenderer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flashcard, CanvasElement } from '@/types/flashcard';

interface EmbeddedDeckViewerProps {
  deckId: string;
  width: number;
  height: number;
  className?: string;
}

export const EmbeddedDeckViewer: React.FC<EmbeddedDeckViewerProps> = ({
  deckId,
  width,
  height,
  className = ''
}) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !deckId) return;

    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: cardsData, error: cardsError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('set_id', deckId)
          .order('created_at', { ascending: true });

        if (cardsError) throw cardsError;

        const transformedCards: Flashcard[] = cardsData?.map(card => ({
          ...card,
          front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
          back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
          hint: card.hint || '',
          last_reviewed_at: card.last_reviewed_at || null,
          card_type: (card.card_type as Flashcard['card_type']) || 'standard',
          interactive_type: (card.interactive_type as Flashcard['interactive_type']) || null,
          countdown_timer: card.countdown_timer || 0,
          password: card.password || null
        })) || [];

        setCards(transformedCards);
      } catch (error) {
        console.error('Error fetching embedded deck cards:', error);
        setError('Failed to load deck');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user, deckId]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading deck...</div>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {error || 'No cards in this deck'}
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const currentElements = showAnswer ? currentCard.back_elements : currentCard.front_elements;

  return (
    <div 
      className={`flex flex-col bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {showAnswer ? 'Answer' : 'Question'}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-2 overflow-hidden">
        <StudyCardRenderer
          elements={currentElements}
          className="w-full h-full"
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: 'unset',
            aspectRatio: 'unset'
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-6 px-2"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleFlip}
          className="h-6 px-3 text-xs"
        >
          Flip
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="h-6 px-2"
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
