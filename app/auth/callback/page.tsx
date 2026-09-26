'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Supabase OAuth PKCE callback (client-side, static hosting).
 *
 * The Supabase browser client auto-exchanges ?code= on creation
 * (detectSessionInUrl is enabled by default), so this page must NOT call
 * exchangeCodeForSession itself — the code is single-use. It only observes
 * the resulting session and navigates to `next`.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const nextParam = url.searchParams.get('next');
    // Only allow relative redirects (open-redirect guard)
    const next =
      nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : '/feed';

    let finished = false;
    const go = (path: string) => {
      if (finished) return;
      finished = true;
      window.history.replaceState(null, '', path);
      router.replace(path);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) go(next);
    });

    // Backstop: if no event arrives (no code, failed or slow exchange),
    // resolve from the current session. getSession() awaits client init,
    // so it also reflects an in-flight automatic exchange.
    const fallback = setTimeout(
      () => {
        void (async () => {
          if (finished) return;
          const { data } = await supabase.auth.getSession();
          if (finished) return;
          if (data.session) go(next);
          else go('/signin?error=auth');
        })();
      },
      code ? 6000 : 0
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <svg className="h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
