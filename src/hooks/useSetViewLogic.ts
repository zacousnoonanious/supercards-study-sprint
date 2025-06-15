import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/contexts/I18nContext';
import { CardTemplate, Flashcard, CanvasElement } from '@/types/flashcard';
import { StudySettings } from '@/components/StudyModePreSettings';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  user_id: string;
}

export const useSetViewLogic = () => {
  const { id: urlSetId } = useParams<{ id: string }>();
  const setId = urlSetId;
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showEnhancedOverview, setShowEnhancedOverview] = useState(false);
  const [showStudySettings, setShowStudySettings] = useState(false);
  const [showPermanentShuffleSettings, setShowPermanentShuffleSettings] = useState(false);
  const [defaultTemplate, setDefaultTemplate] = useState<CardTemplate | undefined>(undefined);

  // Optimized data fetching with React Query
  const { data: setData, isLoading: setLoading, error: setError } = useQuery({
    queryKey: ['flashcard_set', setId],
    queryFn: async () => {
      console.log('Fetching set data for ID:', setId);
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (error) {
        console.error('Error fetching set:', error);
        throw error;
      }
      console.log('Set data fetched:', data);
      return data as FlashcardSet;
    },
    enabled: !!setId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: cardsData, isLoading: cardsLoading, error: cardsError, refetch: refetchCards } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: async () => {
      console.log('Fetching cards for set ID:', setId);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching cards:', error);
        throw error;
      }
      
      console.log('Cards data fetched:', data);
      
      // Type cast the data to match our Flashcard interface
      const typedCards: Flashcard[] = (cardsData || []).map((card, index) => ({
        ...card,
        front_elements: Array.isArray(card.front_elements) ? card.front_elements as unknown as CanvasElement[] : [],
        back_elements: Array.isArray(card.back_elements) ? card.back_elements as unknown as CanvasElement[] : [],
        hint: card.hint || '',
        last_reviewed_at: card.last_reviewed_at || null,
        card_type: (card.card_type as Flashcard['card_type']) || 'normal',
        interactive_type: (card.interactive_type as 'multiple-choice' | 'true-false' | 'fill-in-blank') || null,
        countdown_timer: card.countdown_timer || 0,
        countdown_timer_front: card.countdown_timer_front || 0,
        countdown_timer_back: card.countdown_timer_back || 0,
        countdown_behavior_front: (card.countdown_behavior_front as 'flip' | 'next') || 'flip',
        countdown_behavior_back: (card.countdown_behavior_back as 'flip' | 'next') || 'next',
        flips_before_next: card.flips_before_next || 2,
        password: card.password || null,
        countdown_behavior: ((card as any).countdown_behavior as 'flip' | 'next') || 'flip'
      }));
      
      return typedCards;
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

  return {
    setId,
    isLoading,
    set,
    cards,
    showAIGenerator,
    setShowAIGenerator,
    showEnhancedOverview,
    setShowEnhancedOverview,
    showStudySettings,
    setShowStudySettings,
    showPermanentShuffleSettings,
    setShowPermanentShuffleSettings,
    defaultTemplate,
    handleAIGenerated,
    handleCreateFromTemplate,
    handleSetDefaultTemplate,
    handleDeleteCard,
    handleReorderCards,
    handleNavigateToCard,
    handleStudyFromCard,
    handleStartStudyWithSettings,
    handlePermanentShuffleToggle,
  };
};
