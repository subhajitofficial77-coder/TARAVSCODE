import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Create a Supabase client for Server Components / Server Actions
 */
export function createServerSupabaseClient() {
  // Server components may want to pass cookies manually
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  return supabase;
}

/**
 * Create a Service Role client for admin operations. WARNING: This bypasses RLS.
 */
export function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Service role key or Supabase URL not set');
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
