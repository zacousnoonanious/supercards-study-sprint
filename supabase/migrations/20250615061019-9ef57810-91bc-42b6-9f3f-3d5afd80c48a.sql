
-- Check if the invite token generation function exists, if not create it
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create function to accept invitation and create user
CREATE OR REPLACE FUNCTION public.accept_organization_invite(
  invite_token TEXT,
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record public.organization_invites;
BEGIN
  -- Get the invite record
  SELECT * INTO invite_record
  FROM public.organization_invites
  WHERE invite_token = accept_organization_invite.invite_token
  AND status = 'pending'
  AND expires_at > now();
  
  -- If invite doesn't exist or is expired, return false
  IF invite_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Create organization membership
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    status,
    joined_at
  ) VALUES (
    invite_record.organization_id,
    user_id,
    invite_record.role,
    'active',
    now()
  )
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  
  -- Mark invite as accepted
  UPDATE public.organization_invites
  SET status = 'accepted', accepted_at = now()
  WHERE id = invite_record.id;
  
  RETURN TRUE;
END;
$$;

-- Add missing columns to organization_invites if they don't exist
DO $$
BEGIN
  -- Add first_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_invites' 
                 AND column_name = 'first_name') THEN
    ALTER TABLE public.organization_invites ADD COLUMN first_name TEXT;
  END IF;
  
  -- Add last_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_invites' 
                 AND column_name = 'last_name') THEN
    ALTER TABLE public.organization_invites ADD COLUMN last_name TEXT;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_invites' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.organization_invites ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
  
  -- Add accepted_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organization_invites' 
                 AND column_name = 'accepted_at') THEN
    ALTER TABLE public.organization_invites ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END$$;

-- Ensure RLS is enabled
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Org admins can manage invites for their organization" ON public.organization_invites;
DROP POLICY IF EXISTS "Anyone can view pending invites by token" ON public.organization_invites;

-- Create policies for organization_invites
CREATE POLICY "Org admins can manage invites for their organization"
  ON public.organization_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_invites.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('org_admin', 'super_admin')
      AND om.status = 'active'
    )
  );

CREATE POLICY "Anyone can view pending invites by token"
  ON public.organization_invites
  FOR SELECT
  USING (status = 'pending' AND expires_at > now());
