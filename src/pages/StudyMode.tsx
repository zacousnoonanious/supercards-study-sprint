
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StudyModeCard } from '@/components/StudyModeCard';
import { StudyModeComplete } from '@/components/StudyModeComplete';
import { StudyModeSettings } from '@/components/StudyModeSettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  question: string;
  answer: string;
  hint?: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  set_id: string;
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string | null;
  card_type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected';
  interactive_type?: 'multiple-choice' | 'true-false' | 'fill-in-blank' | null;
  countdown_timer?: number;
  countdown_seconds?: number;
  countdown_behavior?: 'flip' | 'next';
  password?: string | null;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const StudyMode = () => {
  const { setId } = useParams<{ setId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [settings, setSettings] = useState({
    shuffle: false,
    autoFlip: false,
    countdownTimer: 0,
    mode: 'flashcard' as 'flashcard' | 'quiz' | 'review'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (setId) {
      fetchSetAndCards();
    }
  }, [user, setId, navigate]);

  // Handle starting index from URL params
  useEffect(() => {
    const startIndex = searchParams.get('startIndex');
    if (startIndex && !isNaN(parseInt(startIndex))) {
      setCurrentCardIndex(parseInt(startIndex));
    }
  }, [searchParams]);

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
      
      // Transform the data to match our Flashcard interface
      const transformedCards: Flashcard[] = (cardsData || []).map(card => ({
        ...card,
        front_content: card.question || '',
        back_content: card.answer || '',
        front_elements: (card.front_elements as unknown as CanvasElement[]) || [],
        back_elements: (card.back_elements as unknown as CanvasElement[]) || [],
        card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
        interactive_type: (['multiple-choice', 'true-false', 'fill-in-blank'].includes(card.interactive_type as string)) 
          ? (card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') 
          : null,
        countdown_timer: card.countdown_timer || 0,
        countdown_seconds: 0, // Default value since not in database
        countdown_behavior: 'flip' as 'flip' | 'next' // Default value since not in database
      }));
      
      setCards(transformedCards);
    } catch (error) {
      console.error('Error fetching set and cards:', error);
      toast({
        title: t('error.general'),
        description: 'Failed to load study set.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setIsComplete(true);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1)
    }));
    handleNextCard();
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsComplete(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const handleBackToSet = () => {
    navigate(`/sets/${setId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">No cards found</h2>
          <button 
            onClick={() => navigate(`/sets/${setId}`)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Back to Set
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <StudyModeComplete
        title={set.title}
        sessionStats={sessionStats}
        totalCards={cards.length}
        onRestart={handleRestart}
        onBackToSet={handleBackToSet}
      />
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToSet}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Set
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{set.title}</h1>
              <p className="text-muted-foreground">
                Card {currentCardIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
          >
            Settings
          </button>
        </div>

        <StudyModeCard
          card={currentCard}
          showAnswer={showAnswer}
          onFlip={() => setShowAnswer(!showAnswer)}
          onNext={handleNextCard}
          onPrevious={handlePreviousCard}
          onAnswer={handleAnswer}
          canGoPrevious={currentCardIndex > 0}
          canGoNext={currentCardIndex < cards.length - 1}
          settings={settings}
        />

        {showSettings && (
          <StudyModeSettings
            studySettings={settings}
            onSettingsChange={setSettings}
            showPanelView={false}
            onTogglePanelView={() => {}}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default StudyMode;
