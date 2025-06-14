import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Flashcard } from '@/types/flashcard';

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
  // Try multiple possible parameter names to handle different route patterns
  const params = useParams();
  const setId = params.id || params.setId;
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
  const [userAnswer, setUserAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
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

  const currentCard = shuffledCards[currentCardIndex];

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
            countdown_behavior: ((card as any).countdown_behavior as 'flip' | 'next') || 'flip',
            canvas_width: card.canvas_width || 600,
            canvas_height: card.canvas_height || 400,
            metadata: card.metadata || {}
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
            countdown_behavior: 'flip' as const,
            canvas_width: 600,
            canvas_height: 400,
            metadata: {}
          };
        }
      });
      
      console.log('StudyMode: Transformed cards:', transformedCards.length);
      setCards(transformedCards);
      
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

  const applyStudySettings = () => {
    console.log('StudyMode: Applying study settings. Cards count:', cards.length);
    let cardPool = [...cards];

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
    // Setters
    setShuffle,
    setMode,
    setAutoFlip,
    setCountdownTimer,
    setHideHints,
    setSingleAttempt,
    setCurrentTimer,
    setFlipCount,
    // Methods
    getActiveTimer,
    fetchSetAndCards,
    applyStudySettings,
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
