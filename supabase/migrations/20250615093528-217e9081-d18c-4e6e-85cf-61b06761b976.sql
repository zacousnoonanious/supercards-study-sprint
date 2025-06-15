
-- Fix search_path warnings for all database functions
-- Update cleanup_old_editing_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_old_editing_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.editing_sessions
  WHERE last_seen < now() - interval '5 minutes';
END;
$function$;

-- Update get_organizations_by_email_domain function
CREATE OR REPLACE FUNCTION public.get_organizations_by_email_domain(p_email text)
 RETURNS TABLE(id uuid, name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_domain text;
BEGIN
  -- Extract domain from email
  user_domain := split_part(p_email, '@', 2);

  -- Return organizations where the user's domain is in the approved_domains list
  RETURN QUERY
  SELECT o.id, o.name
  FROM public.organizations o
  WHERE user_domain = ANY(o.approved_domains);
END;
$function$;

-- Update generate_invite_token function
CREATE OR REPLACE FUNCTION public.generate_invite_token()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update verify_invite_password function
CREATE OR REPLACE FUNCTION public.verify_invite_password(invite_token text, password text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the password hash for the invite
  SELECT password_hash INTO stored_hash
  FROM public.deck_invite_links
  WHERE invite_token = verify_invite_password.invite_token AND is_active = true;
  
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
$function$;

-- Update hash_password function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$function$;

-- Update generate_org_invite_token function
CREATE OR REPLACE FUNCTION public.generate_org_invite_token()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update generate_org_slug function
CREATE OR REPLACE FUNCTION public.generate_org_slug(org_name text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update set_organization_slug function
CREATE OR REPLACE FUNCTION public.set_organization_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.generate_org_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update accept_organization_invite function
CREATE OR REPLACE FUNCTION public.accept_organization_invite(invite_token text, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update is_domain_approved function
CREATE OR REPLACE FUNCTION public.is_domain_approved(org_id uuid, email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update process_organization_join function
CREATE OR REPLACE FUNCTION public.process_organization_join(org_id uuid, user_id uuid, user_email text, invite_role text DEFAULT 'learner'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update generate_reset_token function
CREATE OR REPLACE FUNCTION public.generate_reset_token()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update generate_temp_password function
CREATE OR REPLACE FUNCTION public.generate_temp_password()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- Update calculate_srs_values function
CREATE OR REPLACE FUNCTION public.calculate_srs_values(current_score integer, previous_ease_factor double precision DEFAULT 2.5, previous_interval integer DEFAULT 1)
 RETURNS TABLE(new_ease_factor double precision, new_interval integer, next_review_date date)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  ease_factor FLOAT := previous_ease_factor;
  interval_days INTEGER := previous_interval;
BEGIN
  -- SM-2 Algorithm implementation
  IF current_score < 3 THEN
    -- Failed review - reset interval and reduce ease factor
    interval_days := 1;
    ease_factor := GREATEST(1.3, ease_factor - 0.2);
  ELSE
    -- Successful review - increase interval based on ease factor
    IF previous_interval = 1 THEN
      interval_days := 6;
    ELSE
      interval_days := ROUND(previous_interval * ease_factor);
    END IF;
    
    -- Adjust ease factor based on performance
    ease_factor := ease_factor + (0.1 - (5 - current_score) * (0.08 + (5 - current_score) * 0.02));
    ease_factor := GREATEST(1.3, ease_factor);
  END IF;
  
  RETURN QUERY SELECT 
    ease_factor,
    interval_days,
    (CURRENT_DATE + interval_days)::DATE;
END;
$function$;

-- Update get_cards_due_for_review function
CREATE OR REPLACE FUNCTION public.get_cards_due_for_review(p_user_id uuid, p_limit integer DEFAULT 50)
 RETURNS TABLE(card_id uuid, set_id uuid, next_review_date date, current_ease_factor double precision, total_reviews integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ucs.card_id,
    f.set_id,
    ucs.next_review_date,
    ucs.current_ease_factor,
    ucs.total_reviews
  FROM public.user_card_stats ucs
  JOIN public.flashcards f ON f.id = ucs.card_id
  WHERE ucs.user_id = p_user_id
    AND ucs.next_review_date <= CURRENT_DATE
  ORDER BY ucs.next_review_date ASC, ucs.current_ease_factor ASC
  LIMIT p_limit;
END;
$function$;

-- Update update_user_streak function
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_stats RECORD;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats FROM public.user_stats WHERE user_id = p_user_id;
  
  -- If no stats exist, create them
  IF current_stats IS NULL THEN
    INSERT INTO public.user_stats (user_id, current_streak, longest_streak, last_study_date)
    VALUES (p_user_id, 1, 1, today_date);
    RETURN;
  END IF;
  
  -- Update streak logic
  IF current_stats.last_study_date IS NULL THEN
    -- First study session
    UPDATE public.user_stats 
    SET current_streak = 1, longest_streak = 1, last_study_date = today_date, updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF current_stats.last_study_date = today_date THEN
    -- Already studied today, no change needed
    RETURN;
  ELSIF current_stats.last_study_date = today_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE public.user_stats 
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_study_date = today_date,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_stats 
    SET current_streak = 1, last_study_date = today_date, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;
