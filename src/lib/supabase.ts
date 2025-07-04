import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function for delay with exponential backoff
const delay = (attempt: number) => new Promise(resolve => 
  setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 8000))
);

// Maximum number of retry attempts
const MAX_RETRIES = 3;

export async function signInWithEmailAndPassword(email: string, password: string) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await delay(attempt - 1);
        console.log(`Retry attempt ${attempt} for sign in...`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const errorDetails = {
          code: error.status,
          message: error.message,
          details: error.details,
          attempt
        };
        console.error('Sign-in error details:', errorDetails);

        // Handle specific error cases that shouldn't be retried
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message?.includes('Rate limit')) {
          throw new Error('Too many attempts. Please wait a few minutes before trying again.');
        }

        // For database errors, continue with retry
        if (error.message === 'Database error granting user') {
          lastError = error;
          continue;
        }

        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      // If it's a specific error we don't want to retry, throw immediately
      if (error.message.includes('Invalid email or password') ||
          error.message.includes('Rate limit')) {
        throw error;
      }
      lastError = error;
      
      // On last attempt, throw a user-friendly error
      if (attempt === MAX_RETRIES) {
        console.error('All sign-in retry attempts failed:', error);
        throw new Error('We are experiencing temporary issues. Please try again in a few minutes.');
      }
    }
  }

  // This should never be reached due to the throw in the last retry,
  // but TypeScript wants it
  throw lastError;
}

export async function signUpWithEmailAndPassword(email: string, password: string, phone: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone_number: phone
        }
      }
    });
    
    if (error) {
      const errorDetails = {
        code: error.status,
        message: error.message,
        details: error.details
      };
      console.error('Sign-up error details:', errorDetails);

      if (error.message?.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (error.message === 'Database error granting user') {
        throw new Error('Unable to create your account. Please try again in a few minutes.');
      } else if (error.message?.includes('Rate limit')) {
        throw new Error('Too many attempts. Please wait a few minutes before trying again.');
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}