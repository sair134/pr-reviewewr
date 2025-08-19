import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb-adapter';

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'user',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        
        // For demo purposes, we'll use a simple check
        // In production, you should hash passwords and use proper authentication
        const user = await User.findOne({ email: credentials.email });
        
        if (user) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }
        
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        await dbConnect();
        
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          if (account.provider === 'github') {
            dbUser.githubToken = account.access_token;
            dbUser.githubUsername = user.name;
          }
          await dbUser.save();
        }
        
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
