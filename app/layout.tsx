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

export const metadata: Metadata = {
  title: {
    default: 'PullMates',
    template: '%s | PullMates',
  },
  description: 'Where developers find their perfect team. Collaborate on projects, find collaborators, and build amazing things together.',
  keywords: ['developer', 'collaboration', 'projects', 'open source', 'github'],
  authors: [{ name: 'PullMates' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PullMates',
    title: 'PullMates',
    description: 'Where developers find their perfect team.',
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
