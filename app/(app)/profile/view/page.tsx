'use client';

import { useEffect, useState } from 'react';
import ProfileView from '@/components/profile/profile-view';

/**
 * Bridge for /profile/:username at runtime (static export has no dynamic routes).
 * Firebase rewrites /profile/* here; we parse the username client-side.
 */
export default function ProfileViewBridgePage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    setUsername(segments[1] ?? '');
  }, []);

  if (!username) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-6">
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
        <div className="h-40 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
      </div>
    );
  }

  return <ProfileView username={username} />;
}
