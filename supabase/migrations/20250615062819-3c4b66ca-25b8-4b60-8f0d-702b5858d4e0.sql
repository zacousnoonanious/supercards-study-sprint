
-- Add a column to user_restrictions to control if a user can change their own password
ALTER TABLE public.user_restrictions
ADD COLUMN IF NOT EXISTS can_change_own_password BOOLEAN NOT NULL DEFAULT false;
