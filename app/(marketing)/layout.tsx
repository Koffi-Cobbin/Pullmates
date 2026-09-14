import NavBar from '@/components/layout/NavBar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
