
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Eye, EyeOff, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
import { Flashcard, FlashcardSet, CanvasElement } from '@/types/flashcard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
      
      // Transform the data to match our Flashcard type
      const transformedCards: Flashcard[] = cardsData?.map(card => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : []
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
    toast({
      title: "Time's up!",
      description: "The timer for this card has expired.",
      variant: "destructive",
    });
    setShowAnswer(true);
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
                onClick={() => navigate(`/set/${setId}`)}
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
          <Button onClick={() => navigate(`/edit-cards/${setId}`)} className="w-full sm:w-auto">
            Open Visual Editor
          </Button>
        </main>
      </div>
    );
  }

  if (studyComplete) {
    const totalCards = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalCards > 0 ? Math.round((sessionStats.correct / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-2 sm:mr-4 p-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Set</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-green-600">Study Complete!</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-green-600">Great job!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-3xl sm:text-4xl font-bold text-primary">{accuracy}%</div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button onClick={resetStudy} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
                <Button variant="outline" onClick={() => navigate(`/set/${setId}`)} className="flex-1">
                  Back to Set
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

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
      
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-2 sm:mr-4 p-2 flex-shrink-0"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Set</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Study: {set.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {cards.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex-shrink-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <div className="text-xs sm:text-sm text-muted-foreground text-right flex-shrink-0">
                <div className="hidden sm:block">
                  Correct: {sessionStats.correct} | Incorrect: {sessionStats.incorrect}
                </div>
                <div className="sm:hidden">
                  {sessionStats.correct}/{sessionStats.incorrect}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full bg-muted h-1">
        <div 
          className="bg-primary h-1 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showSettings && (
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="panel-view"
                checked={showPanelView}
                onCheckedChange={setShowPanelView}
              />
              <Label htmlFor="panel-view" className="text-sm">
                Show answer as panel below (instead of card flip)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-navigation"
                checked={allowNavigation}
                onCheckedChange={setAllowNavigation}
              />
              <Label htmlFor="allow-navigation" className="text-sm">
                Allow navigation between cards during study
              </Label>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto py-4 sm:py-8 px-4 flex-1 flex flex-col">
        <div className="space-y-4 sm:space-y-6 flex-1">
          {showPanelView ? (
            // Panel View (Original behavior)
            <>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Question</h3>
                <StudyCardRenderer elements={currentCard.front_elements} className="mx-auto max-w-full sm:max-w-2xl" />
              </div>
              
              {currentCard.hint && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-primary"
                  >
                    {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                      <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} size="lg" className="w-full sm:w-auto">
                    Reveal Answer
                  </Button>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Answer</h3>
                      <StudyCardRenderer elements={currentCard.back_elements} className="mx-auto max-w-full sm:max-w-2xl" />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                      >
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </Button>
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Correct
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Card Flip View (New behavior)
            <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
              <div className="relative mx-auto max-w-full sm:max-w-2xl" style={{ perspective: '1000px' }}>
                <div 
                  className={`relative w-full transition-transform duration-700 preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div className="absolute w-full backface-hidden">
                    <StudyCardRenderer elements={currentCard.front_elements} className="w-full" />
                  </div>
                  
                  {/* Back Side */}
                  <div className="absolute w-full backface-hidden rotate-y-180">
                    <StudyCardRenderer elements={currentCard.back_elements} className="w-full" />
                  </div>
                </div>
              </div>

              {currentCard.hint && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-primary"
                  >
                    {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                      <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  )}
                </div>
              )}

              {showAnswer && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                  >
                    <XCircle className="w-4 h-4" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Correct
                  </Button>
                </div>
              )}
            </div>
          )}
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
