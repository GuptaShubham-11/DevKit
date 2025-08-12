import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from './db';
import { User } from '@/models/user';
import { loginSchema } from '@/validation/auth';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set!');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }
        const validatedData = loginSchema.safeParse(credentials);

        if (!validatedData.success) {
          throw new Error(validatedData.error.issues[0].message);
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('User not found!');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email first!');
          }

          const isPasswordCorrect = user.isPasswordCorrect(
            credentials.password
          );

          if (!isPasswordCorrect) {
            throw new Error('Invalid password!');
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
          };
        } catch (error) {
          console.error('NextAuth error: ', error);
          throw error;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = await User.create({
              email: user.email,
              username: user.email?.split('@')[0] || `user${Date.now()}`, // Generate username from email
              password: null, // No password for OAuth users
              isVerified: true, // Google accounts are pre-verified
              oAuth: {
                google: {
                  id: user.id,
                  email: user.email,
                },
                profile: {
                  name: user.name,
                  image: user.image,
                },
              },
            });

            // Update user id to match database
            user.id = newUser._id.toString();
          } else {
            // Update existing user's OAuth info if needed
            if (!existingUser.oAuth?.google) {
              existingUser.oAuth = {
                ...existingUser.oAuth,
                google: {
                  id: user.id,
                  email: user.email,
                },
              };
              await existingUser.save();
            }

            user.id = existingUser._id.toString();
          }

          return true;
        } catch (error) {
          console.error('Error in Google sign-in:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 29 * 24 * 60 * 60, // 29 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
