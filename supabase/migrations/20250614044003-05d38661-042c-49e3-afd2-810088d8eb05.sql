
-- Add approved domains to organizations table
ALTER TABLE public.organizations 
ADD COLUMN approved_domains text[] DEFAULT '{}';

-- Add pending approval reason to organization_members
ALTER TABLE public.organization_members 
ADD COLUMN pending_reason text;

-- Update the status constraint to include 'pending_approval'
ALTER TABLE public.organization_members 
DROP CONSTRAINT IF EXISTS organization_members_status_check;

ALTER TABLE public.organization_members 
ADD CONSTRAINT organization_members_status_check 
CHECK (status IN ('active', 'invited', 'pending', 'pending_approval'));

-- Create a function to check if email domain is approved
CREATE OR REPLACE FUNCTION public.is_domain_approved(
  org_id uuid, 
  email text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_domain text;
  approved_domains text[];
BEGIN
  -- Extract domain from email
  user_domain := split_part(email, '@', 2);
  
  -- Get approved domains for organization
  SELECT organizations.approved_domains INTO approved_domains
  FROM public.organizations
  WHERE id = org_id;
  
  -- Check if domain is in approved list
  RETURN user_domain = ANY(approved_domains);
END;
$$;

-- Create function to auto-approve or flag for approval
CREATE OR REPLACE FUNCTION public.process_organization_join(
  org_id uuid,
  user_id uuid,
  user_email text,
  invite_role text DEFAULT 'learner'
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_approved boolean;
  member_status text;
  reason text;
BEGIN
  -- Check if domain is approved
  SELECT public.is_domain_approved(org_id, user_email) INTO is_approved;
  
  IF is_approved THEN
    member_status := 'active';
    reason := NULL;
  ELSE
    member_status := 'pending_approval';
    reason := 'Email domain not in approved list';
  END IF;
  
  -- Insert or update organization member
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    status,
    pending_reason,
    joined_at
  ) VALUES (
    org_id,
    user_id,
    invite_role,
    member_status,
    reason,
    CASE WHEN is_approved THEN now() ELSE NULL END
  )
  ON CONFLICT (organization_id, user_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    pending_reason = EXCLUDED.pending_reason,
    joined_at = EXCLUDED.joined_at,
    updated_at = now();
    
  RETURN member_status;
END;
$$;

-- Add RLS policy to allow org admins to see pending approvals for their organizations
CREATE POLICY "Org admins can view pending member approvals" ON public.organization_members
FOR SELECT USING (
  status = 'pending_approval' AND
  organization_id IN (
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active' 
    AND role IN ('org_admin', 'super_admin')
  )
);
