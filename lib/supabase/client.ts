import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase browser client for Client Components.
 * Singleton — safe to call repeatedly.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
