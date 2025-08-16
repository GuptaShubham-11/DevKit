import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from './db';
import { User } from '@/models/user';
import { loginSchema } from '@/validation/auth';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate presence
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        // Validate format
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0].message);
        }
        const { email, password } = parsed.data;

        await connectToDatabase();

        // Case-insensitive lookup
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email first! Reragister First.');
        }

        // Prevent login if account locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error(
            'Account temporarily locked due to multiple failed logins'
          );
        }

        // Check password
        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
          // Increment login attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          // Lock account after 5 failed attempts
          if (user.loginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 60 min lock
          }
          await user.save({ validateBeforeSave: false });
          throw new Error('Invalid email or password');
        }

        // Reset login attempts on success
        if (user.loginAttempts) {
          user.loginAttempts = 0;
          user.lockedUntil = undefined;
        }
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          image: user.profileImage || null,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // Normalize returned profile
        return {
          id: profile.sub,
          email: profile.email!,
          name: profile.name,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const email = (user as any).email.toLowerCase().trim();
          let existing = await User.findOne({ email });

          if (!existing) {
            existing = await User.create({
              email,
              username: email.split('@')[0],
              password: null,
              isVerified: true,
              oAuth: {
                google: { id: user.id, email },
                profile: { name: user.name, image: user.image },
              },
            });
          } else if (!existing.oAuth?.google) {
            existing.oAuth = {
              ...existing.oAuth,
              google: { id: user.id, email },
              profile: { name: user.name, image: user.image },
            };
            await existing.save({ validateBeforeSave: false });
          }

          // Attach DB id to session
          (user as any).id = existing._id.toString();
          return true;
        } catch (err) {
          console.error('Google signIn error:', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id || token.id;
        token.email = (user as any).email;
        token.username = (user as any).username;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
