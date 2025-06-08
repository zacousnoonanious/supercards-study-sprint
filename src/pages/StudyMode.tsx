import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Shuffle, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { Flashcard } from '@/types/flashcard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  user_id: string;
}

const StudyMode = () => {
  const { setId } = useParams<{ setId: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const shuffleParam = searchParams.get('shuffle') === 'true';
  const modeParam = searchParams.get('mode') || 'flashcard';
  const autoFlipParam = searchParams.get('autoFlip') === 'true';
  const timerParam = parseInt(searchParams.get('timer') || '0', 10);
  const hideHintsParam = searchParams.get('hideHints') === 'true';
  const singleAttemptParam = searchParams.get('singleAttempt') === 'true';

  const [shuffle, setShuffle] = useState(shuffleParam);
  const [mode, setMode] = useState<'flashcard' | 'quiz' | 'mixed'>(modeParam as 'flashcard' | 'quiz' | 'mixed');
  const [autoFlip, setAutoFlip] = useState(autoFlipParam);
  const [countdownTimer, setCountdownTimer] = useState(timerParam);
  const [hideHints, setHideHints] = useState(hideHintsParam);
  const [singleAttempt, setSingleAttempt] = useState(singleAttemptParam);

  // Move all useEffect hooks to the top, before any conditional logic
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (setId) {
      fetchSetAndCards();
    }
  }, [user, setId, navigate]);

  useEffect(() => {
    if (cards.length > 0) {
      applyStudySettings();
    }
  }, [cards, shuffle, mode]);

  // Keyboard navigation useEffect - moved to top to maintain hooks order
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent navigation if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentCard = shuffledCards[currentCardIndex];

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setShowAnswer(false);
            setUserAnswer('');
            setAnswerResult(null);
            setHasAnswered(false);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setShowAnswer(false);
            setUserAnswer('');
            setAnswerResult(null);
            setHasAnswered(false);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!showAnswer && currentCard?.card_type !== 'quiz-only') {
            setShowAnswer(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (showAnswer && currentCard?.card_type !== 'quiz-only') {
            setShowAnswer(false);
          }
          break;
        case ' ': // Spacebar
          e.preventDefault();
          if (currentCard?.card_type !== 'quiz-only') {
            setShowAnswer(!showAnswer);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledCards.length, showAnswer, shuffledCards]);

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
      
      // Transform the data to match our Flashcard interface
      const transformedCards: Flashcard[] = (cardsData || []).map((card, index) => ({
        ...card,
        front_elements: (card.front_elements as unknown as any[]) || [],
        back_elements: (card.back_elements as unknown as any[]) || [],
        card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
        interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null,
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        countdown_timer: card.countdown_timer || 0,
        password: card.password || null,
        position: index, // Add position based on array index
        countdown_behavior: ((card as any).countdown_behavior as 'flip' | 'next') || 'flip'
      }));
      
      setCards(transformedCards);
    } catch (error) {
      console.error('Error fetching set and cards:', error);
      toast({
        title: t('error.general'),
        description: 'Failed to load set details.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyStudySettings = () => {
    let cardPool = [...cards];

    if (shuffle || set?.permanent_shuffle) {
      cardPool = shuffleArray([...cardPool]);
    }

    if (searchParams.get('startIndex')) {
      const startIndex = parseInt(searchParams.get('startIndex') || '0', 10);
      setCurrentCardIndex(startIndex);
    }

    setShuffledCards(cardPool);
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleSettingsChange = (newSettings: { shuffle: boolean; mode: 'flashcard' | 'quiz' | 'mixed' }) => {
    setShuffle(newSettings.shuffle);
    setMode(newSettings.mode);
    setShowSettings(false);
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    setHasAnswered(true);
    setAnswerResult(isCorrect);
  };

  const handleNextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setAnswerResult(null);
      setHasAnswered(false);
    } else {
      toast({
        title: "Deck Complete",
        description: "You've reached the end of the deck!",
      });
    }
  };

  const currentCard = shuffledCards[currentCardIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <header className="shadow-sm border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
                <Navigation />
              </div>
              <UserDropdown />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Set not found</h2>
            <Button onClick={() => navigate('/decks')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/decks')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{set.title}</h1>
              <p className="text-muted-foreground">{set.description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {t('settings')}
          </Button>
        </div>

        {currentCard ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Card {currentCardIndex + 1} / {shuffledCards.length}
              </h2>
            </div>

            <div className="aspect-[4/3] bg-gray-50 rounded border overflow-hidden">
              <StudyCardRenderer
                elements={showAnswer ? currentCard.back_elements : currentCard.front_elements}
                textScale={1}
                cardWidth={600}
                cardHeight={400}
                allowMultipleAttempts={!singleAttempt}
                onQuizAnswer={(elementId, correct, answerIndex) => handleAnswerSubmit(correct)}
                onFillInBlankAnswer={(elementId, correct) => handleAnswerSubmit(correct)}
              />
            </div>

            {currentCard.hint && !hideHints && (
              <div className="text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                Hint: {currentCard.hint}
              </div>
            )}

            {answerResult !== null && (
              <div className={`flex items-center justify-center text-lg font-semibold ${answerResult ? 'text-green-500' : 'text-red-500'}`}>
                {answerResult ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 mr-2" />
                    Incorrect.
                  </>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleNextCard} disabled={!showAnswer && currentCard.card_type !== 'quiz-only'}>
                {t('next')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">No cards in this set</h2>
          </div>
        )}
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Study Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">Shuffle Cards</Label>
              <Switch id="shuffle" checked={shuffle} onCheckedChange={(checked) => setShuffle(checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mode">Study Mode</Label>
              <select
                id="mode"
                className="border rounded px-2 py-1"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'flashcard' | 'quiz' | 'mixed')}
              >
                <option value="flashcard">Flashcard</option>
                <option value="quiz">Quiz</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMode;
