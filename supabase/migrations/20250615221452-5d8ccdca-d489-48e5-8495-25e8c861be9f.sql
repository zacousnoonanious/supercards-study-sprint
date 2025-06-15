
-- Fix the delete_organization function to resolve user_id ambiguity
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
  -- Use table alias to avoid ambiguity between parameter and column names
  SELECT om.role INTO user_role
  FROM public.organization_members om
  WHERE om.organization_id = org_id 
    AND om.user_id = delete_organization.user_id
    AND om.status = 'active';
  
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
