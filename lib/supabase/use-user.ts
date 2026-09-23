'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from './client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface UseUserResult {
  user: User | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
}

/**
 * Client-side current user from Supabase Auth.
 * Replaces next-auth useSession for UI components.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;

    void supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (cancelled) return;
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      setStatus(u ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setStatus('unauthenticated');
  };

  return { user, status, signOut };
}
