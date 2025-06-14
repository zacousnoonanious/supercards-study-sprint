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
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
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
  const { id: setId } = useParams<{ id: string }>();
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
  const [flipCount, setFlipCount] = useState(0);
  const [maxFlips, setMaxFlips] = useState(2);
  const [currentTimer, setCurrentTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Define currentCard before using it in useEffect hooks
  const currentCard = shuffledCards[currentCardIndex];

  // Get the active timer for the current card side - this will be passed to StudyNavigationBar
  const getActiveTimer = () => {
    if (!currentCard) return 0;
    
    const frontTimer = currentCard.countdown_timer_front || 0;
    const backTimer = currentCard.countdown_timer_back || 0;
    const globalTimer = countdownTimer || 0;
    
    if (showAnswer) {
      return backTimer || globalTimer;
    } else {
      return frontTimer || globalTimer;
    }
  };

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

  // Timer effect for advanced countdown functionality
  useEffect(() => {
    if (!currentCard) return;

    const frontTimer = currentCard.countdown_timer_front || 0;
    const backTimer = currentCard.countdown_timer_back || 0;
    const currentTimerValue = showAnswer ? backTimer : frontTimer;

    if (currentTimerValue > 0) {
      const timer = setTimeout(() => {
        const behavior = showAnswer ? 
          (currentCard.countdown_behavior_back || 'next') : 
          (currentCard.countdown_behavior_front || 'flip');

        if (behavior === 'flip') {
          if (!showAnswer) {
            // Front side timer expired, flip to back
            setShowAnswer(true);
            setFlipCount(prev => prev + 1);
          } else {
            // Back side timer expired, check if we should continue flipping
            const maxFlipsForCard = currentCard.flips_before_next || 2;
            if (flipCount < maxFlipsForCard - 1) {
              setShowAnswer(false);
              setFlipCount(prev => prev + 1);
            } else {
              // Max flips reached, go to next card
              handleNextCard();
              setFlipCount(0);
            }
          }
        } else {
          // behavior === 'next'
          handleNextCard();
          setFlipCount(0);
        }
      }, currentTimerValue * 1000);

      setCurrentTimer(timer);

      return () => {
        clearTimeout(timer);
        setCurrentTimer(null);
      };
    }
  }, [currentCard, showAnswer, flipCount, currentCardIndex]);

  // Reset flip count when card changes
  useEffect(() => {
    setFlipCount(0);
    if (currentTimer) {
      clearTimeout(currentTimer);
      setCurrentTimer(null);
    }
  }, [currentCardIndex]);

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
            handleNavigate('prev');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentCardIndex < shuffledCards.length - 1) {
            handleNavigate('next');
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
            handleFlipCard();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledCards.length, showAnswer, shuffledCards]);

  const fetchSetAndCards = async () => {
    try {
      console.log('Fetching set and cards for setId:', setId);
      
      // Fetch set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) {
        console.error('Error fetching set:', setError);
        throw setError;
      }
      
      console.log('Set data fetched:', setData);
      setSet(setData);

      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        throw cardsError;
      }
      
      console.log('Cards data fetched:', cardsData);
      
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

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
      setAnswerResult(null);
      setHasAnswered(false);
      setFlipCount(0);
    } else if (direction === 'next' && currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setAnswerResult(null);
      setHasAnswered(false);
      setFlipCount(0);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleTimeUp = () => {
    if (!currentCard) return;
    
    const behavior = showAnswer ? 
      (currentCard.countdown_behavior_back || 'next') : 
      (currentCard.countdown_behavior_front || 'flip');

    if (behavior === 'flip') {
      if (!showAnswer) {
        setShowAnswer(true);
        setFlipCount(prev => prev + 1);
      } else {
        const maxFlipsForCard = currentCard.flips_before_next || 2;
        if (flipCount < maxFlipsForCard - 1) {
          setShowAnswer(false);
          setFlipCount(prev => prev + 1);
        } else {
          handleNextCard();
          setFlipCount(0);
        }
      }
    } else {
      handleNextCard();
      setFlipCount(0);
    }
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
      setFlipCount(0);
    } else {
      toast({
        title: t('study.deckComplete'),
        description: t('study.deckCompleteMessage'),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('study.loading')}</div>
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
            <h2 className="text-xl font-semibold text-foreground">{t('common.setNotFound')}</h2>
            <Button onClick={() => navigate('/decks')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.goBack')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 flex flex-col max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/decks')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
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
            {t('common.settings')}
          </Button>
        </div>

        {currentCard ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-center mb-8">
                <div 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg"
                  style={{ 
                    width: `${currentCard.canvas_width || 600}px`,
                    height: `${currentCard.canvas_height || 450}px`,
                  }}
                >
                  <StudyCardRenderer
                    elements={showAnswer ? currentCard.back_elements : currentCard.front_elements}
                    textScale={1}
                    cardWidth={currentCard.canvas_width || 600}
                    cardHeight={currentCard.canvas_height || 450}
                    allowMultipleAttempts={!singleAttempt}
                    onQuizAnswer={(elementId, correct, answerIndex) => handleAnswerSubmit(correct)}
                    onFillInBlankAnswer={(elementId, correct) => handleAnswerSubmit(correct)}
                  />
                </div>
              </div>

              {currentCard.hint && !hideHints && (
                <div className="text-sm text-muted-foreground flex justify-center mb-4">
                  <div className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {t('study.hint')}: {currentCard.hint}
                  </div>
                </div>
              )}

              {answerResult !== null && (
                <div className={`flex items-center justify-center text-lg font-semibold mb-4 ${answerResult ? 'text-green-500' : 'text-red-500'}`}>
                  {answerResult ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      {t('common.correct')}!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 mr-2" />
                      {t('common.incorrect')}.
                    </>
                  )}
                </div>
              )}
            </div>

            <StudyNavigationBar
              currentIndex={currentCardIndex}
              totalCards={shuffledCards.length}
              onNavigate={handleNavigate}
              onFlipCard={handleFlipCard}
              showAnswer={showAnswer}
              countdownTimer={getActiveTimer()}
              onTimeUp={handleTimeUp}
              allowNavigation={true}
            />
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{t('common.noCardsInSet')}</h2>
          </div>
        )}
      </main>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.studySettings')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">{t('common.shuffleCards')}</Label>
              <Switch id="shuffle" checked={shuffle} onCheckedChange={(checked) => setShuffle(checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mode">{t('common.studyMode')}</Label>
              <select
                id="mode"
                className="border rounded px-2 py-1"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'flashcard' | 'quiz' | 'mixed')}
              >
                <option value="flashcard">{t('study.flashcardMode')}</option>
                <option value="quiz">{t('study.quizMode')}</option>
                <option value="mixed">{t('study.mixedMode')}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowSettings(false)}>
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMode;
