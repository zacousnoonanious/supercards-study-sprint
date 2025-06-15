
-- Add an email column to the profiles table to store user emails
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email addresses for existing users from the auth.users table
UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;

-- Create a unique index on the email column for faster lookups and to ensure uniqueness
-- This command is designed to be run once as part of this migration.
CREATE UNIQUE INDEX profiles_email_unique_idx ON public.profiles(email);

-- Update the handle_new_user function to automatically populate the email field for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, language, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    '/placeholder.svg',
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en'),
    NEW.email
  );
  RETURN NEW;
END;
$function$
