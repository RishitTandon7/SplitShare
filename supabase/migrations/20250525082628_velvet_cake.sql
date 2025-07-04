/*
  # Improve sign-in error handling and logging

  1. Changes
    - Add detailed error logging for user creation
    - Improve error handling in handle_new_user function
    - Add additional user profile validation
    - Grant necessary permissions
*/

-- Create a function to log auth errors
CREATE OR REPLACE FUNCTION log_auth_error(
  error_message text,
  error_details jsonb DEFAULT NULL,
  user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auth.audit_log_entries (
    instance_id,
    ip_address,
    created_at,
    user_id,
    payload
  )
  VALUES (
    gen_random_uuid(),
    '127.0.0.1',
    NOW(),
    user_id,
    jsonb_build_object(
      'error', error_message,
      'details', error_details
    )
  );
END;
$$;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Improved handle_new_user function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  profile_name text;
  error_details jsonb;
BEGIN
  -- Log attempt to create user profile
  PERFORM log_auth_error(
    'Attempting to create user profile',
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'metadata', NEW.raw_user_meta_data
    ),
    NEW.id
  );

  -- Get profile name with fallback
  profile_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert the profile with detailed error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      name,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      profile_name,
      NOW(),
      NOW()
    );

    -- Log successful profile creation
    PERFORM log_auth_error(
      'User profile created successfully',
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email
      ),
      NEW.id
    );

  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, log and continue
      PERFORM log_auth_error(
        'Profile already exists',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', NEW.email
        ),
        NEW.id
      );
      RETURN NEW;
    
    WHEN OTHERS THEN
      -- Capture error details
      GET STACKED DIAGNOSTICS 
        error_details = PG_EXCEPTION_CONTEXT;
      
      -- Log the error
      PERFORM log_auth_error(
        'Error creating user profile: ' || SQLERRM,
        jsonb_build_object(
          'user_id', NEW.id,
          'email', NEW.email,
          'error_context', error_details
        ),
        NEW.id
      );
      
      RAISE EXCEPTION 'Failed to create user profile: % (Details: %)', 
        SQLERRM, 
        error_details;
  END;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT INSERT ON auth.audit_log_entries TO authenticated, service_role;