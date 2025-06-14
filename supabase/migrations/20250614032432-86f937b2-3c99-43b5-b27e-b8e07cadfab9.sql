
-- Add password field to deck_invite_links table
ALTER TABLE public.deck_invite_links 
ADD COLUMN password_hash TEXT DEFAULT NULL;

-- Update the joinDeckViaInvite function to handle password verification
CREATE OR REPLACE FUNCTION public.verify_invite_password(
  invite_token TEXT,
  password TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the password hash for the invite
  SELECT password_hash INTO stored_hash
  FROM public.deck_invite_links
  WHERE invite_token = invite_token AND is_active = true;
  
  -- If no password is set, allow access
  IF stored_hash IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If password is required but not provided, deny access
  IF password IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verify the password using crypt
  RETURN stored_hash = crypt(password, stored_hash);
END;
$$;

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;
