import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/types/flashcard';
import { useSRS } from '@/hooks/useSRS';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  user_id: string;
}

export const useStudyMode = () => {
  // Fix: Get setId from the correct parameter name used in the route
  const { id: setId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { recordCardReview, startStudySession, endStudySession } = useSRS();

  console.log('useStudyMode: Initialized with setId:', setId);

  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [currentTimer, setCurrentTimer] = useState<NodeJS.Timeout | null>(null);
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });

  const shuffleParam = searchParams.get('shuffle') === 'true';
  const modeParam = searchParams.get('mode') || 'flashcard';
  const autoFlipParam = searchParams.get('autoFlip') === 'true';
  const timerParam = parseInt(searchParams.get('timer') || '0', 10);
  const hideHintsParam = searchParams.get('hideHints') === 'true';
  const singleAttemptParam = searchParams.get('singleAttempt') === 'true';
  const srsEnabledParam = searchParams.get('srs') === 'true';

  const [shuffle, setShuffle] = useState(shuffleParam);
  const [mode, setMode] = useState<'flashcard' | 'quiz' | 'mixed'>(modeParam as 'flashcard' | 'quiz' | 'mixed');
  const [autoFlip, setAutoFlip] = useState(autoFlipParam);
  const [countdownTimer, setCountdownTimer] = useState(timerParam);
  const [hideHints, setHideHints] = useState(hideHintsParam);
  const [singleAttempt, setSingleAttempt] = useState(singleAttemptParam);
  const [srsEnabled, setSrsEnabled] = useState(srsEnabledParam);

  const currentCard = shuffledCards[currentCardIndex];

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

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

  const applyStudySettings = (cardsToShuffle: Flashcard[]) => {
    console.log('StudyMode: Applying study settings. Cards count:', cardsToShuffle.length);
    let cardPool = [...cardsToShuffle];

    if (shuffle || set?.permanent_shuffle) {
      console.log('StudyMode: Shuffling cards');
      cardPool = shuffleArray([...cardPool]);
    }

    if (searchParams.get('startIndex')) {
      const startIndex = parseInt(searchParams.get('startIndex') || '0', 10);
      setCurrentCardIndex(startIndex);
    }

    console.log('StudyMode: Setting shuffled cards:', cardPool.length);
    setShuffledCards(cardPool);
  };

  const fetchSetAndCards = async () => {
    if (!setId || !user) {
      console.log('StudyMode: Missing setId or user:', { setId, user: !!user });
      setLoading(false);
      return;
    }

    try {
      console.log('StudyMode: Fetching set and cards for setId:', setId);
      setLoading(true);
      
      // Fetch set data with better error handling
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .maybeSingle();

      if (setError) {
        console.error('StudyMode: Error fetching set:', setError);
        toast({
          title: t('error.general'),
          description: 'Failed to load deck details: ' + setError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!setData) {
        console.log('StudyMode: Set not found for id:', setId);
        toast({
          title: t('error.general'),
          description: 'Deck not found',
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      console.log('StudyMode: Set data fetched:', setData);
      setSet(setData);

      // Fetch cards data with better error handling
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('StudyMode: Error fetching cards:', cardsError);
        toast({
          title: t('error.general'),
          description: 'Failed to load cards: ' + cardsError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      console.log('StudyMode: Raw cards data fetched:', cardsData);
      console.log('StudyMode: Number of cards found:', cardsData?.length || 0);
      
      if (!cardsData || cardsData.length === 0) {
        console.log('StudyMode: No cards found for set:', setId);
        setCards([]);
        setShuffledCards([]);
        setLoading(false);
        return;
      }

      // Transform cards with better error handling for each card
      const transformedCards: Flashcard[] = cardsData.map((card, index) => {
        console.log('StudyMode: Transforming card:', card.id);
        
        try {
          return {
            id: card.id,
            set_id: card.set_id,
            question: card.question || '',
            answer: card.answer || '',
            front_content: card.question || '',
            back_content: card.answer || '',
            front_elements: Array.isArray(card.front_elements) ? card.front_elements as any[] : [],
            back_elements: Array.isArray(card.back_elements) ? card.back_elements as any[] : [],
            card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
            interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null,
            hint: card.hint || '',
            created_at: card.created_at,
            updated_at: card.updated_at,
            last_reviewed_at: card.last_reviewed_at || null,
            countdown_timer: card.countdown_timer || 0,
            countdown_timer_front: card.countdown_timer_front || 0,
            countdown_timer_back: card.countdown_timer_back || 0,
            countdown_behavior_front: (card.countdown_behavior_front as 'flip' | 'next') || 'flip',
            countdown_behavior_back: (card.countdown_behavior_back as 'flip' | 'next') || 'next',
            flips_before_next: card.flips_before_next || 2,
            password: card.password || null,
            position: index,
            canvas_width: card.canvas_width || 600,
            canvas_height: card.canvas_height || 400,
            metadata: typeof card.metadata === 'object' && card.metadata !== null 
              ? card.metadata as { tags?: string[]; aiTags?: string[]; [key: string]: any; }
              : { tags: [], aiTags: [] }
          };
        } catch (transformError) {
          console.error('StudyMode: Error transforming card:', card.id, transformError);
          // Return a basic card structure if transformation fails
          return {
            id: card.id,
            set_id: card.set_id,
            question: card.question || 'Error loading card',
            answer: card.answer || 'Error loading card',
            front_content: card.question || 'Error loading card',
            back_content: card.answer || 'Error loading card',
            front_elements: [],
            back_elements: [],
            card_type: 'normal' as const,
            interactive_type: null,
            hint: '',
            created_at: card.created_at,
            updated_at: card.updated_at,
            last_reviewed_at: null,
            countdown_timer: 0,
            countdown_timer_front: 0,
            countdown_timer_back: 0,
            countdown_behavior_front: 'flip' as const,
            countdown_behavior_back: 'next' as const,
            flips_before_next: 2,
            password: null,
            position: index,
            canvas_width: 600,
            canvas_height: 400,
            metadata: { tags: [], aiTags: [] }
          };
        }
      });
      
      console.log('StudyMode: Transformed cards:', transformedCards.length);
      setCards(transformedCards);
      
      // Apply study settings immediately with the fetched cards
      applyStudySettings(transformedCards);
      
      // Start study session
      if (!studySessionId && user?.id) {
        const session = await startStudySession(setId, mode, srsEnabled);
        if (session) {
          setStudySessionId(session.id);
          setSessionStartTime(new Date());
        }
      }
      
    } catch (error) {
      console.error('StudyMode: Error in fetchSetAndCards:', error);
      toast({
        title: t('error.general'),
        description: 'Failed to load study data.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  const handleAnswerSubmit = async (isCorrect: boolean) => {
    setHasAnswered(true);
    setAnswerResult(isCorrect);

    // Update session stats
    setSessionStats(prev => ({
      cardsReviewed: prev.cardsReviewed + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1)
    }));

    // Record SRS review if enabled
    if (srsEnabled && currentCard) {
      const score = isCorrect ? 4 : 1; // Simple mapping for now
      await recordCardReview(currentCard.id, score);
    }
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
      // End study session
      handleEndSession();
      toast({
        title: t('study.deckComplete'),
        description: t('study.deckCompleteMessage'),
      });
    }
  };

  const handleEndSession = async () => {
    if (studySessionId && sessionStartTime) {
      const totalTimeSeconds = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      await endStudySession(
        studySessionId,
        totalTimeSeconds,
        sessionStats.cardsReviewed,
        sessionStats.correctAnswers,
        sessionStats.incorrectAnswers
      );
    }
  };

  // Move all useEffect hooks to the top, before any conditional logic
  useEffect(() => {
    console.log('StudyMode: useEffect - user:', !!user, 'setId:', setId);
    if (!user) {
      console.log('StudyMode: No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    if (setId) {
      console.log('StudyMode: Fetching set and cards for setId:', setId);
      fetchSetAndCards();
    }
  }, [user, setId, navigate]);

  // Timer effect for advanced countdown functionality
  useEffect(() => {
    if (!currentCard) return;

    const frontTimer = currentCard.countdown_timer_front || 0;
    const backTimer = currentCard.countdown_timer_back || 0;
    const currentTimerValue = showAnswer ? backTimer : frontTimer;

    if (currentTimerValue > 0) {
      const timer = setTimeout(() => {
        handleTimeUp();
      }, currentTimerValue * 1000);

      setCurrentTimer(timer);

      return () => {
        clearTimeout(timer);
        setCurrentTimer(null);
      };
    }
  }, [currentCard, showAnswer, currentCardIndex]);

  // Reset flip count when card changes
  useEffect(() => {
    setFlipCount(0);
    if (setCurrentTimer) {
      setCurrentTimer(null);
    }
  }, [currentCardIndex]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      handleEndSession();
    };
  }, []);

  return {
    // State
    set,
    cards,
    shuffledCards,
    currentCard,
    currentCardIndex,
    showAnswer,
    loading,
    userAnswer,
    answerResult,
    hasAnswered,
    flipCount,
    currentTimer,
    shuffle,
    mode,
    autoFlip,
    countdownTimer,
    hideHints,
    singleAttempt,
    srsEnabled,
    sessionStats,
    // Setters
    setShuffle,
    setMode,
    setAutoFlip,
    setCountdownTimer,
    setHideHints,
    setSingleAttempt,
    setSrsEnabled,
    setCurrentTimer,
    setFlipCount,
    // Methods
    getActiveTimer,
    fetchSetAndCards,
    applyStudySettings: (cards: Flashcard[]) => applyStudySettings(cards),
    handleNavigate,
    handleFlipCard,
    handleTimeUp,
    handleAnswerSubmit,
    handleNextCard,
    // Navigation
    navigate,
    setId,
    t
  };
};
