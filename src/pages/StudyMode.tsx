
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
}

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
      setCards(cardsData || []);
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

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowHint(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setStudyComplete(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
              <h1 className="text-2xl font-bold text-indigo-600">Study Mode</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-12 px-4 text-center">
          <h2 className="text-xl font-semibold mb-4">No cards to study</h2>
          <p className="text-gray-600 mb-6">Add some flashcards to this set first!</p>
          <Button onClick={() => navigate(`/add-card/${setId}`)}>
            Add Cards
          </Button>
        </main>
      </div>
    );
  }

  if (studyComplete) {
    const totalCards = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalCards > 0 ? Math.round((sessionStats.correct / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
              <h1 className="text-2xl font-bold text-indigo-600">Study Complete!</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto py-12 px-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">Great job!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold text-indigo-600">{accuracy}%</div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
              </div>
              <div className="flex space-x-4">
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(`/set/${setId}`)}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">Study: {set.title}</h1>
                <p className="text-sm text-gray-600">
                  Card {currentIndex + 1} of {cards.length}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Correct: {sessionStats.correct} | Incorrect: {sessionStats.incorrect}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full bg-gray-200 h-1">
        <div 
          className="bg-indigo-600 h-1 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto py-8 px-4">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-center text-lg text-gray-600">Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-xl font-medium mb-6">{currentCard.question}</p>
              
              {currentCard.hint && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-indigo-600"
                  >
                    {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                      <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  )}
                </div>
              )}

              {!showAnswer ? (
                <Button onClick={() => setShowAnswer(true)} className="mb-6">
                  Reveal Answer
                </Button>
              ) : (
                <div className="mb-6">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mb-4">
                    <p className="font-medium">{currentCard.answer}</p>
                  </div>
                  <div className="flex space-x-4 justify-center">
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="outline"
                      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Incorrect
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Correct
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudyMode;
