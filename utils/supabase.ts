/**
 * Secure Supabase client for Chrome Extension
 * 
 * IMPORTANT SECURITY NOTES:
 * 1. Only use the anon key in client-side code
 * 2. NEVER use the service role key in client-side code
 * 3. Always enable Row Level Security (RLS) in Supabase
 * 4. Configure RLS policies to restrict access appropriately
 * 
 * This file should only be used if you need client-side Supabase access.
 * Currently, the extension uses chrome.storage.sync for local storage.
 * 
 * To use this file, install @supabase/supabase-js:
 *   npm install @supabase/supabase-js
 */

// Note: This import will fail if @supabase/supabase-js is not installed
// Install it with: npm install @supabase/supabase-js
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These should come from environment variables or a secure config
// For Chrome extensions, you may need to use chrome.storage or a build-time config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client for client-side use
 * 
 * WARNING: Only use this if you have:
 * 1. Enabled Row Level Security (RLS) on all tables
 * 2. Configured appropriate RLS policies
 * 3. Verified that the anon key cannot access sensitive data
 * 
 * @returns Supabase client instance
 */
export function createSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase URL and anon key must be configured. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables. ' +
      'See .env.example for reference.'
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false, // Chrome extensions handle storage differently
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Creates a Supabase client with user authentication
 * Use this when you need authenticated requests
 * 
 * @param accessToken - User's access token from authentication
 * @returns Authenticated Supabase client instance
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  const client = createSupabaseClient();
  
  // Set the session with the provided token
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  } as any);
  
  return client;
}
