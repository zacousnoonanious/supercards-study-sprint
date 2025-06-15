
-- Restore admin privileges for zacnoonan@gmail.com in Zac's Org
UPDATE public.organization_members 
SET role = 'org_admin', 
    status = 'active',
    updated_at = now()
WHERE user_id = (
    SELECT id FROM public.profiles WHERE email = 'zacnoonan@gmail.com'
) 
AND organization_id = (
    SELECT id FROM public.organizations WHERE name = 'Zac''s Org'
);
