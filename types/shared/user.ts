export interface User {
  _id: string;
  email: string;
  username: string;
  password: string;
  isAdmin: boolean;
  profileImage?: string;
  subscriptionTier: string;
  isVerified: boolean;
  oAuth?: {
    google?: {
      id: string;
      email: string;
    };
    profile?: {
      name: string;
      image: string;
    };
  };
  otp?: string;
  otpExpiry?: string;
  emailVerifiedAt: string;
  lastLoginAt?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  bio?: string;
  website?: string;
  githubUsername?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}
