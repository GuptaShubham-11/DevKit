import { z } from 'zod';

// Common patterns
const emailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const usernamePattern = /^[a-zA-Z0-9]+$/;
const passwordPatternLetter = /(?=.*[A-Za-z])/;
const passwordPatternNumber = /(?=.*[0-9])/;
const passwordPatternSpecial = /(?=.*[!@#$%&*])/;

// Registration
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(usernamePattern, 'Username can only contain letters and numbers')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(passwordPatternLetter, 'Password must contain at least one letter')
    .regex(passwordPatternNumber, 'Password must contain at least one number')
    .regex(
      passwordPatternSpecial,
      'Password must contain at least one special character'
    )
    .trim(),
});

// Login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password is required')
    .max(64, 'Password is too long')
    .trim(),
});

// OTP Request
export const requestOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
});

// OTP Verification
export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 characters')
    .regex(/^\d{6}$/, 'OTP must be numeric')
    .trim(),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(usernamePattern, 'Username can only contain letters and numbers')
    .toLowerCase()
    .trim(),
});

// Password Reset
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .regex(emailPattern, 'Invalid email address')
    .toLowerCase()
    .trim(),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 characters')
    .regex(/^\d{6}$/, 'OTP must be numeric')
    .trim(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(passwordPatternLetter, 'Password must contain at least one letter')
    .regex(passwordPatternNumber, 'Password must contain at least one number')
    .regex(
      passwordPatternSpecial,
      'Password must contain at least one special character'
    )
    .trim(),
});

// Profile Update
export const updateProfileSchema = z.object({
  profileImage: z.string().url('Invalid profileImage URL').optional(),
  bio: z.string().max(200, 'Bio is too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  githubUsername: z
    .string()
    .max(39, 'GitHub username too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid GitHub username')
    .optional(),
  subscriptionTier: z.enum(['free', 'premium']).optional(),
});

// Change Password
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, 'Current password is required')
    .max(64, 'Password is too long')
    .trim(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(passwordPatternLetter, 'Password must contain at least one letter')
    .regex(passwordPatternNumber, 'Password must contain at least one number')
    .regex(
      passwordPatternSpecial,
      'Password must contain at least one special character'
    )
    .trim(),
});

// Types
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RequestOtpData = z.infer<typeof requestOtpSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UsernameData = z.infer<typeof usernameSchema>;
