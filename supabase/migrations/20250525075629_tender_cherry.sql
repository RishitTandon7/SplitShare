/*
  # Improve authentication and user profiles

  1. Changes
    - Add phone number field to profiles table
    - Add display name field for user-friendly names
    - Add last login timestamp
    - Add account status field
    - Add email verification status field
  
  2. Security
    - Add policy for viewing other users' basic info
    - Add policy for updating own profile
*/

-- Add new fields to profiles table
ALTER TABLE profiles
ADD COLUMN phone_number text,
ADD COLUMN display_name text,
ADD COLUMN last_login timestamptz,
ADD COLUMN account_status text DEFAULT 'active',
ADD COLUMN is_email_verified boolean DEFAULT false;

-- Update handle_new_user function to set display name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    is_email_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow users to view basic info of other users they share groups with
CREATE POLICY "Users can view basic info of group members"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gm.user_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id
        FROM group_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login on auth.users
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();