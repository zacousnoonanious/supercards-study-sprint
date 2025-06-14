
-- Create a table to store shareable invite links
CREATE TABLE public.deck_invite_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on deck_invite_links
ALTER TABLE public.deck_invite_links ENABLE ROW LEVEL SECURITY;

-- Create policies for deck_invite_links
CREATE POLICY "Deck owners can manage invite links"
  ON public.deck_invite_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets fs
      WHERE fs.id = deck_invite_links.set_id
      AND fs.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active invite links for joining"
  ON public.deck_invite_links
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create function to generate random invite tokens
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_deck_invite_links_updated_at
  BEFORE UPDATE ON public.deck_invite_links
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
