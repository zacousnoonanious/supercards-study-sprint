
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Edit, ArrowLeft, Sparkles, Grid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { EditorCardOverview } from '@/components/EditorCardOverview';
import { EnhancedCardButton } from '@/components/EnhancedCardButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CanvasElement, CardTemplate, Flashcard } from '@/types/flashcard';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const SetView = () => {
  const { setId } = useParams<{ setId: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<CardTemplate | undefined>(undefined);

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
      const transformedCards = (cardsData || []).map(card => ({
        ...card,
        front_content: card.question || '',
        back_content: card.answer || '',
        front_elements: (card.front_elements as unknown as CanvasElement[]) || [],
        back_elements: (card.back_elements as unknown as CanvasElement[]) || [],
        card_type: (card.card_type as 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') || 'normal',
        interactive_type: card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank' | null
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

  const handleAIGenerated = () => {
    setShowAIGenerator(false);
    fetchSetAndCards();
    toast({
      title: "Success",
      description: "AI-generated cards have been added to your deck!",
    });
  };

  const handleCardCreated = () => {
    setShowCardCreator(false);
    fetchSetAndCards();
  };

  const handleCreateCard = async () => {
    if (!setId) return;

    const newCard = {
      question: 'New Card',
      answer: 'Answer',
      hint: '',
      front_elements: [] as any,
      back_elements: [] as any,
      set_id: setId,
      card_type: 'normal' as const,
      countdown_timer: 0,
      canvas_width: 600,
      canvas_height: 450,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(newCard)
        .select()
        .single();

      if (error) throw error;

      fetchSetAndCards();
      toast({
        title: "Success",
        description: "New card created successfully!",
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: "Error",
        description: "Failed to create new card.",
        variant: "destructive"
      });
    }
  };

  const handleCreateFromTemplate = async (template: CardTemplate) => {
    if (!setId) return;

    const newFrontElements = template.front_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    
    const newBackElements = template.back_elements.map(el => ({
      ...el,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));

    const newCard = {
      question: template.front_elements.find(el => el.type === 'text')?.content || 'New Card',
      answer: template.back_elements.find(el => el.type === 'text')?.content || 'Answer',
      hint: '',
      front_elements: newFrontElements as any,
      back_elements: newBackElements as any,
      set_id: setId,
      card_type: template.card_type === 'normal' ? 'normal' : template.card_type,
      countdown_timer: 0,
      canvas_width: template.canvas_width || 600,
      canvas_height: template.canvas_height || 450,
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert(newCard)
        .select()
        .single();

      if (error) throw error;

      fetchSetAndCards();
      toast({
        title: "Success",
        description: `Card created from ${template.name} template!`,
      });
    } catch (error) {
      console.error('Error creating card from template:', error);
      toast({
        title: "Error",
        description: "Failed to create card from template.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultTemplate = (template: CardTemplate) => {
    setDefaultTemplate(template);
    localStorage.setItem('defaultCardTemplate', JSON.stringify(template));
    toast({
      title: "Default Template Set",
      description: `${template.name} is now your default card template.`,
    });
  };

  const handleReorderCards = async (reorderedCards: Flashcard[]) => {
    setCards(reorderedCards);
    
    try {
      const updates = reorderedCards.map((card, index) => 
        supabase
          .from('flashcards')
          .update({ updated_at: new Date(Date.now() + index).toISOString() })
          .eq('id', card.id)
      );
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering cards:', error);
    }
  };

  const handleNavigateToCard = (cardIndex: number) => {
    const card = cards[cardIndex];
    if (card) {
      navigate(`/sets/${setId}/cards/${card.id}`);
    }
  };

  // Load default template from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('defaultCardTemplate');
    if (saved) {
      try {
        setDefaultTemplate(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading default template:', error);
      }
    }
  }, []);

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

  if (showCardOverview) {
    return (
      <EditorCardOverview
        cards={cards}
        currentCardIndex={0}
        onReorderCards={handleReorderCards}
        onNavigateToCard={handleNavigateToCard}
        onBackToEditor={() => setShowCardOverview(false)}
      />
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCardOverview(true)}
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              Overview
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/edit-cards/${setId}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {t('edit')}
            </Button>
            <Button
              onClick={() => navigate(`/study/${setId}`)}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t('decks.study')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-sm">Card {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Front:</h4>
                    <p className="text-sm">{card.question}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Back:</h4>
                    <p className="text-sm">{card.answer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardContent className="flex items-center justify-center h-full min-h-[200px]">
              <EnhancedCardButton
                onCreateCard={handleCreateCard}
                onCreateFromTemplate={handleCreateFromTemplate}
                onSetDefaultTemplate={handleSetDefaultTemplate}
                defaultTemplate={defaultTemplate}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Flashcard Generator</DialogTitle>
          </DialogHeader>
          <AIFlashcardGenerator
            setId={setId!}
            onGenerated={handleAIGenerated}
            mode="add-to-set"
          />
        </DialogContent>
      </Dialog>

      {/* Card Creator Dialog */}
      <Dialog open={showCardCreator} onOpenChange={setShowCardCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
          </DialogHeader>
          <InteractiveCardCreator
            setId={setId!}
            onCardCreated={handleCardCreated}
            onClose={() => setShowCardCreator(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SetView;
