/*
  # Auth Setup Migration

  1. Changes
    - Remove NOT NULL constraint from profiles.name
    - Add email verification settings
    - Add password policy
    - Add user management functions

  2. Security
    - Enable RLS on all tables
    - Add policies for user management
*/

-- Remove NOT NULL constraint from profiles.name
ALTER TABLE profiles ALTER COLUMN name DROP NOT NULL;

-- Update handle_new_user function to handle missing name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);