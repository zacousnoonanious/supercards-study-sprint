
-- Enable RLS on deck_collaborators table
ALTER TABLE public.deck_collaborators ENABLE ROW LEVEL SECURITY;

-- Allow users to view collaborations for sets they own or are collaborators on
CREATE POLICY "Users can view relevant collaborations"
  ON public.deck_collaborators
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    set_id IN (
      SELECT id FROM public.flashcard_sets WHERE user_id = auth.uid()
    )
  );

-- Allow set owners to insert collaborators
CREATE POLICY "Set owners can add collaborators"
  ON public.deck_collaborators
  FOR INSERT
  WITH CHECK (
    set_id IN (
      SELECT id FROM public.flashcard_sets WHERE user_id = auth.uid()
    )
  );

-- Allow set owners and collaborators to update their own records
CREATE POLICY "Users can update their own collaborations"
  ON public.deck_collaborators
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    set_id IN (
      SELECT id FROM public.flashcard_sets WHERE user_id = auth.uid()
    )
  );

-- Allow set owners to delete collaborators
CREATE POLICY "Set owners can remove collaborators"
  ON public.deck_collaborators
  FOR DELETE
  USING (
    set_id IN (
      SELECT id FROM public.flashcard_sets WHERE user_id = auth.uid()
    )
  );
