
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SRSCardStats {
  card_id: string;
  set_id: string;
  next_review_date: string;
  current_ease_factor: number;
  total_reviews: number;
}

interface CardReview {
  card_id: string;
  score: number;
  ease_factor: number;
  interval_days: number;
  next_review: string;
}

export const useSRS = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardsDue, setCardsDue] = useState<SRSCardStats[]>([]);

  const calculateSRSValues = async (score: number, previousEaseFactor = 2.5, previousInterval = 1) => {
    try {
      const { data, error } = await supabase.rpc('calculate_srs_values', {
        current_score: score,
        previous_ease_factor: previousEaseFactor,
        previous_interval: previousInterval
      });

      if (error) throw error;
      return data[0]; // Function returns array, we want first result
    } catch (error) {
      console.error('Error calculating SRS values:', error);
      throw error;
    }
  };

  const recordCardReview = async (cardId: string, score: number) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get current card stats
      const { data: currentStats } = await supabase
        .from('user_card_stats')
        .select('current_ease_factor, current_interval_days, total_reviews')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .maybeSingle();

      const previousEaseFactor = currentStats?.current_ease_factor || 2.5;
      const previousInterval = currentStats?.current_interval_days || 1;

      // Calculate new SRS values
      const srsValues = await calculateSRSValues(score, previousEaseFactor, previousInterval);

      // Record the review
      const { error: reviewError } = await supabase
        .from('card_reviews')
        .insert({
          user_id: user.id,
          card_id: cardId,
          score,
          ease_factor: srsValues.new_ease_factor,
          interval_days: srsValues.new_interval,
          next_review: srsValues.next_review_date
        });

      if (reviewError) throw reviewError;

      // Update or insert card stats
      const { error: statsError } = await supabase
        .from('user_card_stats')
        .upsert({
          user_id: user.id,
          card_id: cardId,
          current_ease_factor: srsValues.new_ease_factor,
          current_interval_days: srsValues.new_interval,
          next_review_date: srsValues.next_review_date,
          total_reviews: (currentStats?.total_reviews || 0) + 1,
          correct_reviews: score >= 3 ? ((currentStats as any)?.correct_reviews || 0) + 1 : ((currentStats as any)?.correct_reviews || 0),
          last_reviewed_at: new Date().toISOString()
        });

      if (statsError) throw statsError;

      // Update user streak
      await supabase.rpc('update_user_streak', { p_user_id: user.id });

      console.log('Card review recorded successfully:', { cardId, score, srsValues });
      
    } catch (error) {
      console.error('Error recording card review:', error);
      toast({
        title: 'Error',
        description: 'Failed to save review progress',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCardsDueForReview = async (limit = 50) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc('get_cards_due_for_review', {
        p_user_id: user.id,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cards due for review:', error);
      return [];
    }
  };

  const fetchCardsDue = async () => {
    setLoading(true);
    try {
      const cards = await getCardsDueForReview();
      setCardsDue(cards);
    } catch (error) {
      console.error('Error fetching due cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const startStudySession = async (setId: string, studyMode = 'flashcard', srsEnabled = false) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          set_id: setId,
          study_mode: studyMode,
          srs_enabled: srsEnabled,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  };

  const endStudySession = async (
    sessionId: string, 
    totalTimeSeconds: number, 
    cardsReviewed: number, 
    correctAnswers: number, 
    incorrectAnswers: number
  ) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_time_seconds: totalTimeSeconds,
          cards_reviewed: cardsReviewed,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Update user stats
      await updateUserStats(totalTimeSeconds, cardsReviewed);
      
    } catch (error) {
      console.error('Error ending study session:', error);
    }
  };

  const updateUserStats = async (studyTimeSeconds: number, cardsReviewed: number) => {
    if (!user?.id) return;

    try {
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('total_study_time_seconds, total_cards_reviewed')
        .eq('user_id', user.id)
        .maybeSingle();

      const newTotalTime = (currentStats?.total_study_time_seconds || 0) + studyTimeSeconds;
      const newTotalCards = (currentStats?.total_cards_reviewed || 0) + cardsReviewed;

      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_study_time_seconds: newTotalTime,
          total_cards_reviewed: newTotalCards
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCardsDue();
    }
  }, [user?.id]);

  return {
    loading,
    cardsDue,
    recordCardReview,
    getCardsDueForReview,
    fetchCardsDue,
    startStudySession,
    endStudySession,
    calculateSRSValues
  };
};
