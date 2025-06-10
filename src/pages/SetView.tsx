import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Edit, ArrowLeft, Sparkles, Grid, Settings, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { EditorCardOverview } from '@/components/EditorCardOverview';
import { EnhancedCardButton } from '@/components/EnhancedCardButton';
import { EnhancedSetOverview } from '@/components/EnhancedSetOverview';
import { StudyModePreSettings, StudySettings } from '@/components/StudyModePreSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CanvasElement, CardTemplate, Flashcard } from '@/types/flashcard';
import { SetViewSkeleton } from '@/components/LoadingSkeletons';
import { useRoutePreloader } from '@/hooks/useRoutePreloader';
import { useDataPrefetcher } from '@/hooks/useDataPrefetcher';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  user_id: string;
}

const SetView = () => {
  const { setId } = useParams<{ setId: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enable route preloading and data prefetching
  useRoutePreloader();
  useDataPrefetcher(user?.id);

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);
  const [showEnhancedOverview, setShowEnhancedOverview] = useState(false);
  const [showStudySettings, setShowStudySettings] = useState(false);
  const [showPermanentShuffleSettings, setShowPermanentShuffleSettings] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<CardTemplate | undefined>(undefined);

  // Optimized data fetching with React Query
  const { data: setData, isLoading: setLoading, error: setError } = useQuery({
    queryKey: ['flashcard_set', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (error) throw error;
      return data as FlashcardSet;
    },
    enabled: !!setId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: cardsData, isLoading: cardsLoading, error: cardsError, refetch: refetchCards } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match our Flashcard interface
      const transformedCards: Flashcard[] = (data || []).map((card, index) => ({
        ...card,
        front_elements: (card.front_elements as unknown as CanvasElement[]) || [],
        back_elements: (card.back_elements as unknown as CanvasElement[]) || [],
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        card_type: (card.card_type === 'standard' ? 'normal' : card.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: card.interactive_type || null,
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
      
      return transformedCards;
    },
    enabled: !!setId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = setLoading || cardsLoading;
  const set = setData;
  const cards = cardsData || [];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleAIGenerated = () => {
    setShowAIGenerator(false);
    refetchCards();
    toast({
      title: t('setView.success'),
      description: t('setView.aiCardsAdded'),
    });
  };

  const handleCardCreated = () => {
    setShowCardCreator(false);
    refetchCards();
  };

  const handleCreateCard = async () => {
    if (!setId) return;

    const newCard = {
      question: t('setView.createNewCard'),
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

      refetchCards();
      toast({
        title: t('setView.success'),
        description: t('setView.cardCreated'),
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: t('setView.error'),
        description: t('setView.failedCreateCard'),
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
      question: template.front_elements.find(el => el.type === 'text')?.content || t('setView.createNewCard'),
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

      refetchCards();
      toast({
        title: t('setView.success'),
        description: t('setView.cardCreatedFromTemplate').replace('{templateName}', template.name),
      });
    } catch (error) {
      console.error('Error creating card from template:', error);
      toast({
        title: t('setView.error'),
        description: t('setView.failedCreateFromTemplate'),
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultTemplate = (template: CardTemplate) => {
    setDefaultTemplate(template);
    localStorage.setItem('defaultCardTemplate', JSON.stringify(template));
    toast({
      title: t('setView.defaultTemplateSet'),
      description: t('setView.defaultTemplateMessage').replace('{templateName}', template.name),
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      refetchCards();
      toast({
        title: t('setView.success'),
        description: t('setView.cardDeleted'),
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: t('setView.error'),
        description: t('setView.failedDeleteCard'),
        variant: "destructive"
      });
    }
  };

  const handleReorderCards = async (reorderedCards: Flashcard[]) => {
    try {
      const updates = reorderedCards.map((card, index) => 
        supabase
          .from('flashcards')
          .update({ updated_at: new Date(Date.now() + index).toISOString() })
          .eq('id', card.id)
      );
      
      await Promise.all(updates);
      refetchCards();
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

  const handleStudyFromCard = (cardIndex: number) => {
    navigate(`/study/${setId}?startIndex=${cardIndex}`);
  };

  const handleStartStudyWithSettings = (settings: StudySettings) => {
    const queryParams = new URLSearchParams();
    if (settings.shuffle) queryParams.set('shuffle', 'true');
    if (settings.mode !== 'flashcard') queryParams.set('mode', settings.mode);
    if (settings.autoFlip) queryParams.set('autoFlip', 'true');
    if (settings.countdownTimer > 0) queryParams.set('timer', settings.countdownTimer.toString());
    if (!settings.showHints) queryParams.set('hideHints', 'true');
    if (!settings.allowMultipleAttempts) queryParams.set('singleAttempt', 'true');
    
    const queryString = queryParams.toString();
    navigate(`/study/${setId}${queryString ? `?${queryString}` : ''}`);
  };

  const handlePermanentShuffleToggle = async (enabled: boolean) => {
    if (!setId) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ permanent_shuffle: enabled })
        .eq('id', setId);

      if (error) throw error;

      toast({
        title: t('setView.success'),
        description: enabled ? t('setView.shuffleEnabled') : t('setView.shuffleDisabled'),
      });
    } catch (error) {
      console.error('Error updating permanent shuffle:', error);
      toast({
        title: t('setView.error'),
        description: t('setView.failedUpdateShuffle'),
        variant: "destructive"
      });
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (cards.length > 0) {
            navigate(`/sets/${setId}/cards/${cards[0].id}`);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (cards.length > 0) {
            navigate(`/sets/${setId}/cards/${cards[cards.length - 1].id}`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards, setId, navigate]);

  // Show skeleton loading immediately
  if (isLoading) {
    return <SetViewSkeleton />;
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{t('setView.notFound')}</h2>
            <Button onClick={() => navigate('/decks')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('setView.backToDecks')}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (showEnhancedOverview) {
    return (
      <EnhancedSetOverview
        cards={cards}
        setId={setId!}
        onReorderCards={handleReorderCards}
        onNavigateToCard={handleNavigateToCard}
        onBackToSet={() => setShowEnhancedOverview(false)}
        onCreateCard={handleCreateCard}
        onCreateFromTemplate={handleCreateFromTemplate}
        onSetDefaultTemplate={handleSetDefaultTemplate}
        onDeleteCard={handleDeleteCard}
        onStudyFromCard={handleStudyFromCard}
        defaultTemplate={defaultTemplate}
        permanentShuffle={set?.permanent_shuffle || false}
        onPermanentShuffleChange={handlePermanentShuffleToggle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
              onClick={() => setShowPermanentShuffleSettings(true)}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              {t('setView.deckSettings')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEnhancedOverview(true)}
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              {t('setView.enhancedOverview')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('setView.aiGenerate')}
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
              onClick={() => setShowStudySettings(true)}
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
                <CardTitle className="text-sm">{t('setView.cardNumber').replace('{number}', (index + 1).toString())}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">{t('setView.front')}</h4>
                    <p className="text-sm">{card.question}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">{t('setView.back')}</h4>
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

      {/* Study Mode Pre-Settings Dialog */}
      <StudyModePreSettings
        open={showStudySettings}
        onClose={() => setShowStudySettings(false)}
        onStartStudy={handleStartStudyWithSettings}
        totalCards={cards.length}
      />

      {/* Permanent Shuffle Settings Dialog */}
      <Dialog open={showPermanentShuffleSettings} onOpenChange={setShowPermanentShuffleSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('setView.deckSettings')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="permanent-shuffle">{t('setView.permanentShuffle')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('setView.permanentShuffleDesc')}
                </p>
              </div>
              <Switch
                id="permanent-shuffle"
                checked={set?.permanent_shuffle || false}
                onCheckedChange={handlePermanentShuffleToggle}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('setView.aiGenerateTitle')}</DialogTitle>
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
            <DialogTitle>{t('setView.createNewCardTitle')}</DialogTitle>
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
