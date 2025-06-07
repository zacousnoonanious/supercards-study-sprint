
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
  textScale?: number;
}

export const EmbeddedDeckViewer: React.FC<EmbeddedDeckViewerProps> = ({
  deckId,
  width,
  height,
  className = '',
  textScale = 1
}) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate scaling factor to fit the standard card size (800x533) into the element dimensions
  const scaleX = width / 800;
  const scaleY = height / 533;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
  const finalTextScale = textScale * scale;

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
          card_type: (card.card_type === 'standard' ? 'normal' : card.card_type as Flashcard['card_type']) || 'normal',
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
        <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontSize: `${12 * finalTextScale}px` }}>
          Loading deck...
        </div>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ width, height }}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontSize: `${12 * finalTextScale}px` }}>
          {error || 'No cards in this deck'}
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const currentElements = showAnswer ? currentCard.back_elements : currentCard.front_elements;

  const headerHeight = Math.max(20, 24 * scale);
  const controlsHeight = Math.max(20, 32 * scale);
  const cardHeight = height - headerHeight - controlsHeight;

  return (
    <div 
      className={`flex flex-col bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{ height: headerHeight }}
      >
        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: `${10 * finalTextScale}px` }}>
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: `${10 * finalTextScale}px` }}>
          {showAnswer ? 'Answer' : 'Question'}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 overflow-hidden" style={{ height: cardHeight }}>
        <div 
          className="w-full h-full"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${100 / scale}%`,
            height: `${100 / scale}%`
          }}
        >
          <StudyCardRenderer
            elements={currentElements}
            className="w-full h-full border-0"
            style={{ 
              width: '800px', 
              height: '533px',
              minHeight: '533px',
              maxWidth: 'none',
              aspectRatio: 'unset'
            }}
            textScale={finalTextScale}
          />
        </div>
      </div>

      {/* Controls */}
      <div 
        className="flex items-center justify-between px-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        style={{ height: controlsHeight }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{ 
            height: `${Math.max(16, 24 * scale)}px`, 
            padding: `0 ${Math.max(4, 8 * scale)}px`,
            fontSize: `${10 * finalTextScale}px`
          }}
        >
          <ChevronLeft style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleFlip}
          style={{ 
            height: `${Math.max(16, 24 * scale)}px`, 
            padding: `0 ${Math.max(8, 12 * scale)}px`,
            fontSize: `${10 * finalTextScale}px`
          }}
        >
          Flip
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          style={{ 
            height: `${Math.max(16, 24 * scale)}px`, 
            padding: `0 ${Math.max(4, 8 * scale)}px`,
            fontSize: `${10 * finalTextScale}px`
          }}
        >
          <ChevronRight style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }} />
        </Button>
      </div>
    </div>
  );
};
