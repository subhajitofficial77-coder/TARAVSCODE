import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const NEXT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const NEXT_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!NEXT_URL || !NEXT_KEY) {
  // Don't throw during HMR; let callers handle missing env in server contexts.
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment');
}

// Ensure a single browser client across HMR by attaching to globalThis
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var __SUPABASE_BROWSER_CLIENT__: any;
}

const defaultOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!globalThis.__SUPABASE_BROWSER_CLIENT__) {
    // @ts-ignore
    globalThis.__SUPABASE_BROWSER_CLIENT__ = createClient<Database>(NEXT_URL, NEXT_KEY, defaultOptions);
  }
}

export function createBrowserClient(url: string, key: string) {
  if (typeof window === 'undefined') {
    // On server, create a fresh client (server-side usage should use service role where needed)
    return createClient<Database>(url, key, defaultOptions as any);
  }

  // @ts-ignore
  if (!globalThis.__SUPABASE_BROWSER_CLIENT__) {
    // fallback if not set yet
    // @ts-ignore
    globalThis.__SUPABASE_BROWSER_CLIENT__ = createClient<Database>(url, key, defaultOptions as any);
  }
  // @ts-ignore
  return globalThis.__SUPABASE_BROWSER_CLIENT__ as ReturnType<typeof createClient>;
}

// also export default pre-created client for convenience in server-less contexts
// @ts-ignore
export const supabase = (typeof window !== 'undefined' ? globalThis.__SUPABASE_BROWSER_CLIENT__ : createClient<Database>(NEXT_URL, NEXT_KEY, defaultOptions as any));

export default supabase;
