
-- Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_in_leaderboard boolean DEFAULT true,
ADD COLUMN display_name text;

-- Update display_name to use first_name + last_name if not set
UPDATE public.profiles 
SET display_name = COALESCE(first_name || ' ' || last_name, 'Anonymous User')
WHERE display_name IS NULL;

-- Create leaderboard view for efficient querying
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  us.current_streak,
  us.longest_streak,
  us.total_study_time_seconds,
  us.total_cards_reviewed,
  us.last_study_date,
  -- Calculate rank for each metric
  ROW_NUMBER() OVER (ORDER BY us.current_streak DESC, us.longest_streak DESC) as streak_rank,
  ROW_NUMBER() OVER (ORDER BY us.total_cards_reviewed DESC) as cards_rank,
  ROW_NUMBER() OVER (ORDER BY us.total_study_time_seconds DESC) as time_rank,
  -- Calculate overall score (weighted combination)
  (us.current_streak * 10 + us.total_cards_reviewed * 0.1 + us.total_study_time_seconds * 0.001) as overall_score
FROM public.profiles p
LEFT JOIN public.user_stats us ON p.id = us.user_id
WHERE p.show_in_leaderboard = true
  AND us.total_cards_reviewed > 0; -- Only show users with activity

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_stats ON public.user_stats(current_streak DESC, total_cards_reviewed DESC, total_study_time_seconds DESC);

-- Function to get user's leaderboard position
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(p_user_id uuid)
RETURNS TABLE(
  streak_position integer,
  cards_position integer,
  time_position integer,
  overall_position integer,
  total_users integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_ranks AS (
    SELECT 
      streak_rank,
      cards_rank,
      time_rank,
      ROW_NUMBER() OVER (ORDER BY overall_score DESC) as overall_rank
    FROM public.leaderboard_stats
    WHERE id = p_user_id
  ),
  total_count AS (
    SELECT COUNT(*) as total FROM public.leaderboard_stats
  )
  SELECT 
    ur.streak_rank::integer,
    ur.cards_rank::integer,
    ur.time_rank::integer,
    ur.overall_rank::integer,
    tc.total::integer
  FROM user_ranks ur
  CROSS JOIN total_count tc;
END;
$$;

-- Enable RLS on profiles for leaderboard access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading public leaderboard data
CREATE POLICY "Allow reading leaderboard profiles" ON public.profiles
FOR SELECT USING (show_in_leaderboard = true);

-- Policy to allow users to update their own privacy settings
CREATE POLICY "Users can update own profile privacy" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
