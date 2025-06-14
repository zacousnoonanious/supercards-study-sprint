
-- First, let's check if RLS is enabled and create proper policies for flashcard_sets
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can create their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can update their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can delete their own sets" ON public.flashcard_sets;

-- Enable RLS on flashcard_sets table
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that don't reference organization_members
CREATE POLICY "Users can view their own sets" 
  ON public.flashcard_sets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sets" 
  ON public.flashcard_sets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sets" 
  ON public.flashcard_sets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sets" 
  ON public.flashcard_sets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Also ensure flashcards table has proper RLS policies
DROP POLICY IF EXISTS "Users can view cards from their sets" ON public.flashcards;
DROP POLICY IF EXISTS "Users can create cards in their sets" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update cards in their sets" ON public.flashcards;
DROP POLICY IF EXISTS "Users can delete cards from their sets" ON public.flashcards;

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for flashcards that reference flashcard_sets
CREATE POLICY "Users can view cards from their sets" 
  ON public.flashcards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cards in their sets" 
  ON public.flashcards 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their sets" 
  ON public.flashcards 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their sets" 
  ON public.flashcards 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );
