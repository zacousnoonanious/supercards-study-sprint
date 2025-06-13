
-- Create a table to track deck collaborators
CREATE TABLE public.deck_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(set_id, user_id)
);

-- Enable RLS on deck_collaborators
ALTER TABLE public.deck_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for deck_collaborators
CREATE POLICY "Users can view collaborators for decks they have access to"
  ON public.deck_collaborators
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.deck_collaborators dc2
      WHERE dc2.set_id = deck_collaborators.set_id
      AND dc2.user_id = auth.uid()
      AND dc2.accepted_at IS NOT NULL
    ) OR
    EXISTS (
      SELECT 1 FROM public.flashcard_sets fs
      WHERE fs.id = deck_collaborators.set_id
      AND fs.user_id = auth.uid()
    )
  );

CREATE POLICY "Deck owners can manage collaborators"
  ON public.deck_collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets fs
      WHERE fs.id = deck_collaborators.set_id
      AND fs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can accept their own invitations"
  ON public.deck_collaborators
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a table to track real-time editing sessions
CREATE TABLE public.editing_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  card_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on editing_sessions
ALTER TABLE public.editing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for editing_sessions
CREATE POLICY "Users can view editing sessions for accessible decks"
  ON public.editing_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deck_collaborators dc
      WHERE dc.set_id = editing_sessions.set_id
      AND dc.user_id = auth.uid()
      AND dc.accepted_at IS NOT NULL
    ) OR
    EXISTS (
      SELECT 1 FROM public.flashcard_sets fs
      WHERE fs.id = editing_sessions.set_id
      AND fs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own editing sessions"
  ON public.editing_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Update flashcard_sets to track if deck is collaborative
ALTER TABLE public.flashcard_sets 
ADD COLUMN is_collaborative BOOLEAN DEFAULT false,
ADD COLUMN collaboration_settings JSONB DEFAULT '{"allowViewers": true, "allowEditors": true, "requireApproval": false}'::jsonb;

-- Enable realtime for the tables
ALTER TABLE public.deck_collaborators REPLICA IDENTITY FULL;
ALTER TABLE public.editing_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.flashcards REPLICA IDENTITY FULL;
ALTER TABLE public.flashcard_sets REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.deck_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.editing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flashcards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flashcard_sets;

-- Create function to clean up old editing sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_editing_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.editing_sessions
  WHERE last_seen < now() - interval '5 minutes';
END;
$$;
