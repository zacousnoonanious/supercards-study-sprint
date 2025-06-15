
-- Create card_reviews table for SRS tracking
CREATE TABLE public.card_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 5),
  ease_factor FLOAT NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review DATE NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id, reviewed_at)
);

-- Create study_sessions table for detailed analytics
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_time_seconds INTEGER DEFAULT 0,
  cards_reviewed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  study_mode TEXT DEFAULT 'flashcard',
  srs_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table for streaks and gamification
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_study_time_seconds INTEGER DEFAULT 0,
  total_cards_reviewed INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table for gamification
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_card_stats table for caching SRS data and quick lookups
CREATE TABLE public.user_card_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  current_ease_factor FLOAT DEFAULT 2.5,
  current_interval_days INTEGER DEFAULT 1,
  next_review_date DATE,
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_reviews
CREATE POLICY "Users can view their own card reviews" 
  ON public.card_reviews FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('org_admin', 'super_admin') 
      AND om.status = 'active'
    )
  );

CREATE POLICY "Users can insert their own card reviews" 
  ON public.card_reviews FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" 
  ON public.study_sessions FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('org_admin', 'super_admin') 
      AND om.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own study sessions" 
  ON public.study_sessions FOR ALL 
  USING (user_id = auth.uid());

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats" 
  ON public.user_stats FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('org_admin', 'super_admin') 
      AND om.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own stats" 
  ON public.user_stats FOR ALL 
  USING (user_id = auth.uid());

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" 
  ON public.user_badges FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('org_admin', 'super_admin') 
      AND om.status = 'active'
    )
  );

CREATE POLICY "Users can insert their own badges" 
  ON public.user_badges FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_card_stats
CREATE POLICY "Users can view their own card stats" 
  ON public.user_card_stats FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('org_admin', 'super_admin') 
      AND om.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own card stats" 
  ON public.user_card_stats FOR ALL 
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_card_reviews_user_id ON public.card_reviews(user_id);
CREATE INDEX idx_card_reviews_next_review ON public.card_reviews(user_id, next_review);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_org_id ON public.study_sessions(organization_id);
CREATE INDEX idx_user_card_stats_user_id ON public.user_card_stats(user_id);
CREATE INDEX idx_user_card_stats_next_review ON public.user_card_stats(user_id, next_review_date);

-- Create function to calculate SRS values using SM-2 algorithm
CREATE OR REPLACE FUNCTION public.calculate_srs_values(
  current_score INTEGER,
  previous_ease_factor FLOAT DEFAULT 2.5,
  previous_interval INTEGER DEFAULT 1
) RETURNS TABLE(
  new_ease_factor FLOAT,
  new_interval INTEGER,
  next_review_date DATE
) LANGUAGE plpgsql AS $$
DECLARE
  ease_factor FLOAT := previous_ease_factor;
  interval_days INTEGER := previous_interval;
BEGIN
  -- SM-2 Algorithm implementation
  IF current_score < 3 THEN
    -- Failed review - reset interval and reduce ease factor
    interval_days := 1;
    ease_factor := GREATEST(1.3, ease_factor - 0.2);
  ELSE
    -- Successful review - increase interval based on ease factor
    IF previous_interval = 1 THEN
      interval_days := 6;
    ELSE
      interval_days := ROUND(previous_interval * ease_factor);
    END IF;
    
    -- Adjust ease factor based on performance
    ease_factor := ease_factor + (0.1 - (5 - current_score) * (0.08 + (5 - current_score) * 0.02));
    ease_factor := GREATEST(1.3, ease_factor);
  END IF;
  
  RETURN QUERY SELECT 
    ease_factor,
    interval_days,
    (CURRENT_DATE + interval_days)::DATE;
END;
$$;

-- Create function to get cards due for review
CREATE OR REPLACE FUNCTION public.get_cards_due_for_review(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
  card_id UUID,
  set_id UUID,
  next_review_date DATE,
  current_ease_factor FLOAT,
  total_reviews INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ucs.card_id,
    f.set_id,
    ucs.next_review_date,
    ucs.current_ease_factor,
    ucs.total_reviews
  FROM public.user_card_stats ucs
  JOIN public.flashcards f ON f.id = ucs.card_id
  WHERE ucs.user_id = p_user_id
    AND ucs.next_review_date <= CURRENT_DATE
  ORDER BY ucs.next_review_date ASC, ucs.current_ease_factor ASC
  LIMIT p_limit;
END;
$$;

-- Create function to update streak and stats
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_stats RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats FROM public.user_stats WHERE user_id = p_user_id;
  
  -- If no stats exist, create them
  IF current_stats IS NULL THEN
    INSERT INTO public.user_stats (user_id, current_streak, longest_streak, last_study_date)
    VALUES (p_user_id, 1, 1, today_date);
    RETURN;
  END IF;
  
  -- Update streak logic
  IF current_stats.last_study_date IS NULL THEN
    -- First study session
    UPDATE public.user_stats 
    SET current_streak = 1, longest_streak = 1, last_study_date = today_date, updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF current_stats.last_study_date = today_date THEN
    -- Already studied today, no change needed
    RETURN;
  ELSIF current_stats.last_study_date = today_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE public.user_stats 
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_study_date = today_date,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_stats 
    SET current_streak = 1, last_study_date = today_date, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;
