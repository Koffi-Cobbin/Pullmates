import { NextResponse } from 'next/server';

/**
 * Next.js middleware placeholder.
 * Will handle auth redirects, route protection, and request rewriting.
 */
export function middleware(): NextResponse {
  // Placeholder — no-op middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
