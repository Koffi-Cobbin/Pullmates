import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/components/providers';
import ScrollToTop from '@/components/scroll-to-top';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PullMates',
    template: '%s | PullMates',
  },
  description:
    'Where developers find their perfect team. Collaborate on projects, find collaborators, and build amazing things together.',
  keywords: [
    'developer',
    'collaboration',
    'projects',
    'open source',
    'github',
    'find collaborators',
    'team up',
  ],
  authors: [{ name: 'PullMates' }],
  creator: 'PullMates',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PullMates',
    title: 'PullMates',
    description:
      'Where developers find their perfect team. Collaborate on projects, find collaborators, and build amazing things together.',
    url: SITE_URL,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1907,
        height: 865,
        alt: 'PullMates — Where Developers Find Their Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PullMates',
    description:
      'Where developers find their perfect team. Collaborate on projects, find collaborators, and build amazing things together.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ScrollToTop />
          {children}
        </Providers>
      </body>
    </html>
  );
}
