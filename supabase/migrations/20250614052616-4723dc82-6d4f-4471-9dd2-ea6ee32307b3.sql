
-- Drop ALL existing policies on organization_members to break the recursion
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can view pending member approvals" ON public.organization_members;

-- Drop ALL existing policies on organizations table too
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update their organizations" ON public.organizations;

-- Temporarily disable RLS on both tables
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for organization_members
CREATE POLICY "Allow users to view their own memberships only"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own memberships"
  ON public.organization_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own memberships"
  ON public.organization_members
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create simple policies for organizations
CREATE POLICY "Allow users to view organizations they created"
  ON public.organizations
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Allow users to create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow creators to update their organizations"
  ON public.organizations
  FOR UPDATE
  USING (created_by = auth.uid());
