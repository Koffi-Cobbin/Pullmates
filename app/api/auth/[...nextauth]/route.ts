import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js route handler for the App Router.
 *
 * Handles all /api/auth/* routes (sign-in, sign-out, callbacks, session).
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
