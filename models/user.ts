import bcrypt from 'bcryptjs';
import { User as SharedUser } from '../types/shared/user';
import mongoose, { model, models, Schema } from 'mongoose';

export interface IUser
  extends Document,
    Omit<SharedUser, '_id' | 'emailVerifiedAt' | 'createdAt' | 'updatedAt'> {
  _id: mongoose.Types.ObjectId;
  emailVerifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    subscriptionTier: {
      type: String,
      default: 'free',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    oAuth: {
      type: Schema.Types.Mixed,
      default: null,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    emailVerifiedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    bio: {
      type: String,
    },
    website: {
      type: String,
    },
    githubUsername: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    lastActiveAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const ROUNDS = Number(process.env.SALT_ROUNDS);
    if (!ROUNDS) {
      throw new Error('SALT_ROUNDS must be set!');
    }
    this.password = await bcrypt.hash(this.password, ROUNDS);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const User = models?.User || model<IUser>('User', userSchema);
