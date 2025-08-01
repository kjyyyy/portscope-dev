// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'demo-client-secret',
    }),
  ],
  pages: {
    signIn: '/',
    error: '/', // Redirect errors back to home page
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return '/dashboard';
    },
    async session({ session }) {
      return session;
    },
    async signIn({ user, account, profile }) {
      // In demo mode, always allow sign in
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
