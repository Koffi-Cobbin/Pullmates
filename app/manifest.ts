import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PullMates',
    short_name: 'PullMates',
    description:
      'Where developers find their perfect team. Collaborate on projects, find collaborators, and build amazing things together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#f97316',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
