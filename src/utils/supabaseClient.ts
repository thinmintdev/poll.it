import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and keys from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}

// Create the default Supabase client for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase client with a specific auth token (for authenticated users)
export const createAuthClient = (authToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  });
};

// Server-side only: Create a Supabase client with the service role key (for admin operations)
// This should NEVER be used in client-side code as it bypasses RLS policies
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, using anonymous key instead');
    return supabase;
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
};