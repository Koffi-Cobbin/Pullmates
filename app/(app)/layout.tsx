import type { Metadata } from 'next';
import NavBar from '@/components/layout/NavBar';

export const metadata: Metadata = {
  title: {
    default: 'PullMates',
    template: '%s | PullMates',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
