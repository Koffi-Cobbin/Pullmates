'use client';

import { useEffect, useState } from 'react';
import ProjectDetailClient from '@/components/project/project-detail';

/**
 * Bridge for /projects/:id at runtime (static export has no dynamic routes).
 * Firebase rewrites /projects/* here; we parse the id client-side.
 */
export default function ProjectViewBridgePage() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    setId(segments[1] ?? '');
  }, []);

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-64 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" />
      </div>
    );
  }

  return <ProjectDetailClient id={id} />;
}
