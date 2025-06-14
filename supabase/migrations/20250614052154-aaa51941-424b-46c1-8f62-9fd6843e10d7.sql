
-- First, let's completely clean up any existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can create their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can update their own sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Users can delete their own sets" ON public.flashcard_sets;

-- Also check for any organization-related policies
DROP POLICY IF EXISTS "Organization members can view sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Organization members can manage sets" ON public.flashcard_sets;
DROP POLICY IF EXISTS "Members can view organization sets" ON public.flashcard_sets;

-- Disable RLS temporarily to ensure clean slate
ALTER TABLE public.flashcard_sets DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;

-- Create very simple, direct policies
CREATE POLICY "Allow users to view their flashcard sets"
  ON public.flashcard_sets
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their flashcard sets"
  ON public.flashcard_sets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their flashcard sets"
  ON public.flashcard_sets
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their flashcard sets"
  ON public.flashcard_sets
  FOR DELETE
  USING (user_id = auth.uid());

-- Also fix organization_members table if it has problematic policies
DROP POLICY IF EXISTS "Users can view their memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can manage their memberships" ON public.organization_members;

-- Create simple policies for organization_members to break any cycles
CREATE POLICY "Users can view their own memberships"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own memberships"
  ON public.organization_members
  FOR UPDATE
  USING (user_id = auth.uid());
