import { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

/**
 * NextAuth.js configuration options.
 *
 * Centralizes all auth logic: providers, callbacks, session strategy.
 * Import this in the API route handler and anywhere that needs auth config.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * JWT callback — fires when a JWT is created or updated.
     * Store the backend access token and user id in the JWT.
     */
    async jwt({ token, account }) {
      // Initial sign-in: attach the GitHub access token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    /**
     * Session callback — controls what's exposed to the client.
     * Expose the access token and user id on the session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      // Expose the backend JWT / access token on the session
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: '/signin',
  },
};
