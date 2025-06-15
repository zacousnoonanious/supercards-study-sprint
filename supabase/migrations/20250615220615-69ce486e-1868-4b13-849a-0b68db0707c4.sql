
-- Add a soft delete column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to handle organization deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_organization_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When an organization is soft deleted (deleted_at is set)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- Remove all organization members
    DELETE FROM public.organization_members 
    WHERE organization_id = NEW.id;
    
    -- Cancel all pending invites
    UPDATE public.organization_invites 
    SET status = 'cancelled' 
    WHERE organization_id = NEW.id AND status = 'pending';
    
    -- Remove organization reference from flashcard sets
    UPDATE public.flashcard_sets 
    SET organization_id = NULL 
    WHERE organization_id = NEW.id;
    
    -- Remove organization reference from deck collaborators
    UPDATE public.deck_collaborators 
    SET organization_id = NULL 
    WHERE organization_id = NEW.id;
    
    -- Remove organization reference from user stats
    UPDATE public.user_stats 
    SET organization_id = NULL 
    WHERE organization_id = NEW.id;
    
    -- Remove organization reference from user badges
    UPDATE public.user_badges 
    SET organization_id = NULL 
    WHERE organization_id = NEW.id;
    
    -- Remove organization reference from study sessions
    UPDATE public.study_sessions 
    SET organization_id = NULL 
    WHERE organization_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for organization deletion
CREATE TRIGGER on_organization_deletion
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_organization_deletion();

-- Create function to soft delete organization (only org admins and super admins)
CREATE OR REPLACE FUNCTION public.delete_organization(org_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user has permission to delete organization
  SELECT role INTO user_role
  FROM public.organization_members
  WHERE organization_id = org_id 
    AND user_id = delete_organization.user_id
    AND status = 'active';
  
  -- Only org_admin and super_admin can delete organizations
  IF user_role NOT IN ('org_admin', 'super_admin') THEN
    RETURN FALSE;
  END IF;
  
  -- Soft delete the organization
  UPDATE public.organizations
  SET deleted_at = NOW()
  WHERE id = org_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;
