
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_members table (this handles both membership and roles)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'manager', 'learner')) DEFAULT 'learner',
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'pending')) DEFAULT 'invited',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create organization_invites table for pending invitations
CREATE TABLE public.organization_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('org_admin', 'manager', 'learner')) DEFAULT 'learner',
  invite_token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Add organization_id to existing flashcard_sets table to scope decks to orgs
ALTER TABLE public.flashcard_sets 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Add organization_id to existing deck_collaborators table
ALTER TABLE public.deck_collaborators 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Add organization_id to existing deck_invite_links table
ALTER TABLE public.deck_invite_links 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations" 
  ON public.organizations 
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create organizations" 
  ON public.organizations 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Org admins can update their organizations" 
  ON public.organizations 
  FOR UPDATE 
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('org_admin', 'super_admin') 
      AND status = 'active'
    )
  );

-- RLS Policies for organization_members
CREATE POLICY "Users can view members of their organizations" 
  ON public.organization_members 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Org admins can manage members" 
  ON public.organization_members 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('org_admin', 'super_admin') 
      AND status = 'active'
    )
  );

-- RLS Policies for organization_invites
CREATE POLICY "Org admins can manage invites" 
  ON public.organization_invites 
  FOR ALL 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('org_admin', 'super_admin') 
      AND status = 'active'
    )
  );

-- Update flashcard_sets RLS to be org-scoped
DROP POLICY IF EXISTS "Users can view their own sets" ON public.flashcard_sets;
CREATE POLICY "Users can view sets in their organizations" 
  ON public.flashcard_sets 
  FOR SELECT 
  USING (
    -- Personal sets (no org) or sets in user's organizations
    organization_id IS NULL AND user_id = auth.uid()
    OR 
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Function to generate organization invite tokens
CREATE OR REPLACE FUNCTION public.generate_org_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to generate organization slug
CREATE OR REPLACE FUNCTION public.generate_org_slug(org_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Trigger to auto-generate slug on organization creation
CREATE OR REPLACE FUNCTION public.set_organization_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.generate_org_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_organization_slug_trigger
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_slug();

-- Add updated_at triggers
CREATE TRIGGER handle_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_organization_members_updated_at 
  BEFORE UPDATE ON public.organization_members 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_updated_at();
