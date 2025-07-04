/*
  # Fix Authentication and Profile Management

  1. Changes
    - Add email index for performance
    - Set up proper permissions
    - Clean up orphaned profiles
    - Create safe profile management function
    - Improve user creation handling
  
  2. Security
    - Update RLS policies
    - Add security definer functions
    - Fix permission issues
*/

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Ensure proper permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;

-- Clean up any orphaned profiles
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Create a function to safely get or create profile
CREATE OR REPLACE FUNCTION get_or_create_profile(
  user_id uuid,
  user_email text,
  user_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- First try to get existing profile
  SELECT id INTO profile_id
  FROM profiles
  WHERE email = user_email;
  
  -- If no profile exists, create one
  IF profile_id IS NULL THEN
    INSERT INTO profiles (
      id,
      email,
      name,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      user_email,
      COALESCE(user_name, split_part(user_email, '@', 1)),
      NOW(),
      NOW()
    )
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Use the safe function to get or create profile
  profile_id := get_or_create_profile(
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create updated policy without FOR SELECT clause
CREATE POLICY "Users can view their own profile"
ON profiles
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = profiles.id
    AND users.email = profiles.email
  )
);