
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { UserDropdown } from '@/components/UserDropdown';
import { StudyContent } from '@/components/study/StudyContent';
import { StudySettingsDialog } from '@/components/study/StudySettingsDialog';
import { StudyHeader } from '@/components/study/StudyHeader';
import { useStudyMode } from '@/hooks/useStudyMode';

const StudyMode = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showSettings, setShowSettings] = useState(false);

  const {
    set,
    shuffledCards,
    currentCard,
    currentCardIndex,
    showAnswer,
    loading,
    answerResult,
    shuffle,
    mode,
    hideHints,
    singleAttempt,
    setShuffle,
    setMode,
    setCurrentTimer,
    setFlipCount,
    getActiveTimer,
    fetchSetAndCards,
    applyStudySettings,
    handleNavigate,
    handleFlipCard,
    handleTimeUp,
    handleAnswerSubmit,
    handleNextCard,
    navigate,
    setId
  } = useStudyMode();

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
    if (shuffledCards.length > 0) {
      applyStudySettings();
    }
  }, [shuffledCards, shuffle, mode]);

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

  // Keyboard navigation useEffect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            handleFlipCard();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (showAnswer && currentCard?.card_type !== 'quiz-only') {
            handleFlipCard();
          }
          break;
        case ' ':
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
      <StudyHeader
        set={set}
        onBackClick={() => navigate('/decks')}
        onSettingsClick={() => setShowSettings(true)}
      />

      {currentCard ? (
        <StudyContent
          currentCard={currentCard}
          showAnswer={showAnswer}
          hideHints={hideHints}
          singleAttempt={singleAttempt}
          answerResult={answerResult}
          currentCardIndex={currentCardIndex}
          totalCards={shuffledCards.length}
          activeTimer={getActiveTimer()}
          onNavigate={handleNavigate}
          onFlipCard={handleFlipCard}
          onTimeUp={handleTimeUp}
          onAnswerSubmit={(elementId, correct, answerIndex) => handleAnswerSubmit(correct)}
          onFillInBlankAnswer={(elementId, correct) => handleAnswerSubmit(correct)}
        />
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">{t('common.noCardsInSet')}</h2>
        </div>
      )}

      <StudySettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        shuffle={shuffle}
        mode={mode}
        onShuffleChange={setShuffle}
        onModeChange={setMode}
      />
    </div>
  );
};

export default StudyMode;
