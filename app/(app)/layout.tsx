import type { Metadata } from 'next';
import NavBar from '@/components/layout/NavBar';

export const metadata: Metadata = {
  title: 'PullMates',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
