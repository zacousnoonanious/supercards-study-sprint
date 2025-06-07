
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
import { StudyModeHeader } from '@/components/StudyModeHeader';
import { StudyModeContent } from '@/components/StudyModeContent';
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
import { StudyModeSettings } from '@/components/StudyModeSettings';
import { StudyModeComplete } from '@/components/StudyModeComplete';
import { Flashcard, FlashcardSet, CanvasElement } from '@/types/flashcard';

const StudyMode = () => {
  const { setId } = useParams<{ setId: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPanelView, setShowPanelView] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(true);
  const [studyComplete, setStudyComplete] = useState(false);
  const [fillInBlankResults, setFillInBlankResults] = useState<{[elementId: string]: boolean}>({});

  // Settings
  const [settings, setSettings] = useState({
    shuffle: false,
    autoFlip: false,
    countdownTimer: 0,
    mode: 'flashcard' as 'flashcard' | 'quiz' | 'review'
  });

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
      
      // Type cast the data to match our Flashcard interface
      const typedCards: Flashcard[] = (cardsData || []).map(card => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as CanvasElement[] : [],
      }));
      
      setCards(typedCards);
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

  const currentCard = useMemo(() => {
    if (cards.length === 0) return null;
    return cards[currentIndex];
  }, [cards, currentIndex]);

  const handleAnswer = useCallback((correct: boolean) => {
    setSessionStats(prev => ({
      ...prev,
      [correct ? 'correct' : 'incorrect']: prev[correct ? 'correct' : 'incorrect'] + 1
    }));
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setShowHint(false);
      setFillInBlankResults({});
    } else {
      setStudyComplete(true);
    }
  }, [currentIndex, cards.length]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'next' && currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    setShowAnswer(false);
    setShowHint(false);
    setFillInBlankResults({});
  }, [currentIndex, cards.length]);

  const handleFlipCard = useCallback(() => {
    setShowAnswer(prev => !prev);
  }, []);

  const handleRevealAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleToggleHint = useCallback(() => {
    setShowHint(prev => !prev);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate(`/set/${setId}`);
  }, [navigate, setId]);

  const handleFillInBlankAnswer = useCallback((elementId: string, correct: boolean) => {
    setFillInBlankResults(prev => ({
      ...prev,
      [elementId]: correct
    }));
  }, []);

  const handleResetStudy = useCallback(() => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStudyComplete(false);
    setShowAnswer(false);
    setShowHint(false);
    setFillInBlankResults({});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!set || !currentCard) {
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
            <h2 className="text-xl font-semibold text-foreground">No cards found</h2>
          </div>
        </main>
      </div>
    );
  }

  if (studyComplete) {
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
        <StudyModeComplete
          setId={setId!}
          sessionStats={sessionStats}
          onResetStudy={handleResetStudy}
        />
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

      <StudyModeHeader
        set={set}
        setId={setId!}
        currentIndex={currentIndex}
        totalCards={cards.length}
        sessionStats={sessionStats}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onGoBack={handleGoBack}
      />

      {showSettings && (
        <StudyModeSettings
          showPanelView={showPanelView}
          allowNavigation={allowNavigation}
          onPanelViewChange={setShowPanelView}
          onNavigationChange={setAllowNavigation}
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <StudyModeContent
          currentCard={currentCard}
          showPanelView={showPanelView}
          showAnswer={showAnswer}
          showHint={showHint}
          onRevealAnswer={handleRevealAnswer}
          onToggleHint={handleToggleHint}
          onAnswer={handleAnswer}
          onFlipCard={handleFlipCard}
          onFillInBlankAnswer={handleFillInBlankAnswer}
          fillInBlankResults={fillInBlankResults}
        />
      </main>

      <StudyNavigationBar
        currentIndex={currentIndex}
        totalCards={cards.length}
        onNavigate={handleNavigate}
        onFlipCard={handleFlipCard}
        showAnswer={showAnswer}
        countdownTimer={settings.countdownTimer}
        onTimeUp={handleRevealAnswer}
        allowNavigation={allowNavigation}
      />
    </div>
  );
};

export default StudyMode;
