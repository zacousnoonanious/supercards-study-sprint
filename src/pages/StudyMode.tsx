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
import { MobileStudyCard } from '@/components/mobile/MobileStudyCard';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { OfflineBanner } from '@/components/mobile/OfflineBanner';
import { InstallPrompt } from '@/components/mobile/InstallPrompt';
import { useStudyMode } from '@/hooks/useStudyMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const StudyMode = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const { isOnline } = usePWA();
  const { saveOfflineStudySession } = useOfflineStorage();
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
    srsEnabled,
    setShuffle,
    setMode,
    setCurrentTimer,
    setFlipCount,
    getActiveTimer,
    fetchSetAndCards,
    handleNavigate,
    handleFlipCard,
    handleTimeUp,
    handleAnswerSubmit,
    handleNextCard,
    navigate,
    setId
  } = useStudyMode();

  // Debug logging to help track the issue
  console.log('StudyMode: Rendered with setId:', setId, 'loading:', loading, 'set:', !!set, 'cards count:', shuffledCards.length);

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

  useEffect(() => {
    console.log('StudyMode: Cards changed, shuffledCards length:', shuffledCards.length);
  }, [shuffledCards, shuffle, mode]);

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

  useEffect(() => {
    setFlipCount(0);
    if (setCurrentTimer) {
      setCurrentTimer(null);
    }
  }, [currentCardIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentCard = shuffledCards[currentCardIndex];

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          if (currentCardIndex > 0) {
            console.log('Keyboard: Navigate to previous card');
            handleNavigate('prev');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          if (currentCardIndex < shuffledCards.length - 1) {
            console.log('Keyboard: Navigate to next card');
            handleNavigate('next');
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          if (!showAnswer && currentCard?.card_type !== 'quiz-only') {
            console.log('Keyboard: Flip card (up arrow)');
            handleFlipCard();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          if (showAnswer && currentCard?.card_type !== 'quiz-only') {
            console.log('Keyboard: Flip card (down arrow)');
            handleFlipCard();
          }
          break;
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          if (currentCard?.card_type !== 'quiz-only') {
            console.log('Keyboard: Flip card (spacebar)');
            handleFlipCard();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, shuffledCards.length, showAnswer, shuffledCards, handleNavigate, handleFlipCard]);

  console.log('StudyMode: Rendering. Loading:', loading, 'Set:', !!set, 'Cards:', shuffledCards.length, 'Current card:', !!currentCard);

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

  if (shuffledCards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader
          set={set}
          onBackClick={() => navigate('/decks')}
          onSettingsClick={() => setShowSettings(true)}
        />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{t('common.noCardsInSet')}</h2>
            <p className="text-muted-foreground mt-2">This deck doesn't have any cards yet.</p>
            <Button onClick={() => navigate('/decks')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.goBack')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Enhanced mobile study card rating handler
  const handleMobileRate = async (rating: number) => {
    const correct = rating >= 3;
    await handleAnswerSubmit(correct);
    
    // Save offline if not online
    if (!isOnline && currentCard) {
      await saveOfflineStudySession({
        setId: currentCard.set_id,
        cardId: currentCard.id,
        score: rating,
        timeSpent: 30, // Approximate time spent
        timestamp: Date.now()
      });
    }
    
    handleNextCard();
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <OfflineBanner />
        
        <StudyHeader
          set={set}
          onBackClick={() => navigate('/decks')}
          onSettingsClick={() => setShowSettings(true)}
        />

        {currentCard ? (
          <div className="flex-1 flex flex-col justify-center px-4 py-8">
            <div className="text-center mb-4">
              <span className="text-sm text-muted-foreground">
                {currentCardIndex + 1} of {shuffledCards.length}
              </span>
            </div>
            
            <MobileStudyCard
              card={currentCard}
              showAnswer={showAnswer}
              onFlip={handleFlipCard}
              onNext={() => handleNavigate('next')}
              onPrevious={() => handleNavigate('prev')}
              onRate={srsEnabled ? handleMobileRate : undefined}
              className="mb-8"
            />
            
            {currentCard.hint && !hideHints && !showAnswer && (
              <div className="text-center text-sm text-muted-foreground mt-4 px-4">
                💡 {currentCard.hint}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">{t('common.noCardsInSet')}</h2>
              <p className="text-muted-foreground mt-2">No cards available to study.</p>
            </div>
          </div>
        )}

        <MobileBottomNav />
        <InstallPrompt />

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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{t('common.noCardsInSet')}</h2>
            <p className="text-muted-foreground mt-2">No cards available to study.</p>
          </div>
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
