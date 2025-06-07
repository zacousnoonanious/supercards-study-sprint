import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
import { StudyModeHeader } from '@/components/StudyModeHeader';
import { StudyModeSettings } from '@/components/StudyModeSettings';
import { StudyModeContent } from '@/components/StudyModeContent';
import { StudyModeComplete } from '@/components/StudyModeComplete';
import { Flashcard, FlashcardSet, CanvasElement } from '@/types/flashcard';

const StudyMode = () => {
  const { setId } = useParams();
  const { user } = useAuth();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [loading, setLoading] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);
  const [showPanelView, setShowPanelView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(true);
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
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setSet(setData);

      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
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

  const updateLastReviewed = async (cardId: string) => {
    try {
      await supabase
        .from('flashcards')
        .update({ last_reviewed_at: new Date().toISOString() })
        .eq('id', cardId);
    } catch (error) {
      console.error('Error updating last reviewed:', error);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const currentCard = cards[currentIndex];
    updateLastReviewed(currentCard.id);

    setSessionStats(prev => ({
      ...prev,
      [correct ? 'correct' : 'incorrect']: prev[correct ? 'correct' : 'incorrect'] + 1
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowHint(false);
    } else {
      setStudyComplete(true);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!allowNavigation) return;
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setShowHint(false);
    } else if (direction === 'next' && currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleTimeUp = () => {
    const currentCard = cards[currentIndex];
    const behavior = currentCard.countdown_behavior || (currentCard.card_type === 'single-sided' ? 'next' : 'flip');
    
    if (behavior === 'next') {
      toast({
        title: "Time's up!",
        description: "Moving to next card.",
        variant: "destructive",
      });
      
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setShowHint(false);
      } else {
        setStudyComplete(true);
      }
    } else {
      toast({
        title: "Time's up!",
        description: "Revealing answer.",
        variant: "destructive",
      });
      setShowAnswer(true);
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowHint(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStudyComplete(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => navigate(`/sets/${setId}`)}
                className="mr-2 sm:mr-4 p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Set</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-primary">Study Mode</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">No cards to study</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">Create some flashcards in the visual editor first!</p>
          <Button onClick={() => navigate(`/sets/${setId}/cards/${cards[0]?.id || ''}`)} className="w-full sm:w-auto">
            Open Visual Editor
          </Button>
        </main>
      </div>
    );
  }

  if (studyComplete) {
    return (
      <StudyModeComplete
        setId={setId!}
        sessionStats={sessionStats}
        onResetStudy={resetStudy}
      />
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `
      }} />
      
      <StudyModeHeader
        set={set}
        setId={setId!}
        currentIndex={currentIndex}
        totalCards={cards.length}
        sessionStats={sessionStats}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {showSettings && (
        <StudyModeSettings
          showPanelView={showPanelView}
          allowNavigation={allowNavigation}
          onPanelViewChange={setShowPanelView}
          onNavigationChange={setAllowNavigation}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <StudyModeContent
            currentCard={currentCard}
            showPanelView={showPanelView}
            showAnswer={showAnswer}
            showHint={showHint}
            onRevealAnswer={() => setShowAnswer(true)}
            onToggleHint={() => setShowHint(!showHint)}
            onAnswer={handleAnswer}
            onFlipCard={handleFlipCard}
          />
        </div>
      </main>

      <StudyNavigationBar
        currentIndex={currentIndex}
        totalCards={cards.length}
        onNavigate={handleNavigate}
        onFlipCard={handleFlipCard}
        showAnswer={showAnswer}
        countdownTimer={currentCard?.countdown_timer || 0}
        onTimeUp={handleTimeUp}
        allowNavigation={allowNavigation}
      />
    </div>
  );
};

export default StudyMode;
