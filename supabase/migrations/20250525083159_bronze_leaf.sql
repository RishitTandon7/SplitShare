/*
  # Add phone number to signup flow

  1. Changes
    - Add phone_number field to profiles table if not exists
    - Update handle_new_user function to include phone number
    - Add validation for phone number format
*/

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Create function to validate phone number format
CREATE OR REPLACE FUNCTION is_valid_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN phone ~ '^\+?[1-9]\d{1,14}$';
END;
$$;

-- Update handle_new_user function to include phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  phone_number text;
BEGIN
  -- Get phone number from metadata
  phone_number := NEW.raw_user_meta_data->>'phone_number';
  
  -- Validate phone number if provided
  IF phone_number IS NOT NULL AND NOT is_valid_phone(phone_number) THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone_number,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    phone_number,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;