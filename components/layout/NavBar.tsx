'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from '@/components/theme-toggle';

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Pullmates"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-xl font-bold text-navy-800 dark:text-white">Pullmates</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/feed"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Feed
              </Link>
              <Link
                href="/projects"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Projects
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {/* User Avatar */}
                <Link href="/profile/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/feed"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Browse Projects
              </Link>
              <ThemeToggle />
              <Link
                href="/api/auth/signin"
                className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="px-6 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/feed"
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link
                  href="/projects"
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Projects
                </Link>
                <Link
                  href="/profile/settings"
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/feed"
                  className="block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Projects
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="block rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white text-center hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
