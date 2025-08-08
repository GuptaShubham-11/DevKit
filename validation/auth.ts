import z from 'zod';

export const registerSchema = z.object({
  email: z
    .email()
    .min(1, { message: 'Email is required!' })
    .max(255, { message: 'Email is too long!' })
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      { message: 'Invalid email address!' }
    ),
  username: z
    .string()
    .min(3, { message: 'Username is required minimum 3 characters!' })
    .max(20, { message: 'Username is too long!' })
    .toLowerCase()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Username can only contain letters and numbers!',
    }),
  password: z
    .string()
    .min(8, { message: 'Password is required minimum 8 characters!' })
    .max(20, { message: 'Password is too long!' })
    .regex(/(?=.*[A-Za-z])/, {
      message: 'At least one small letter and one capital letter',
    })
    .regex(/(?=.*[0-9])/, { message: 'At least one number' })
    .regex(/(?=.*[!@#$%&*])/, { message: 'At least one special character' })
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required!' })
    .max(255, { message: 'Email is too long!' })
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      { message: 'Invalid email address!' }
    ),
  password: z
    .string()
    .min(8, { message: 'Password is required minimum 8 characters!' })
    .max(20, { message: 'Password is too long!' })
    .regex(/(?=.*[A-Za-z])/, {
      message: 'At least one small letter and one capital letter',
    })
    .regex(/(?=.*[0-9])/, { message: 'At least one number' })
    .regex(/(?=.*[!@#$%&*])/, { message: 'At least one special character' })
    .trim(),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required!' })
    .max(255, { message: 'Email is too long!' })
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      { message: 'Invalid email address!' }
    ),
  otp: z
    .string()
    .min(6, { message: 'OTP is required minimum 6 characters!' })
    .max(6, { message: 'OTP is too long!' })
    .trim(),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username is required minimum 3 characters!' })
    .max(20, { message: 'Username is too long!' })
    .toLowerCase()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, {
      message: 'Username can only contain letters and numbers!',
    }),
});

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required!' })
    .max(255, { message: 'Email is too long!' })
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      { message: 'Invalid email address!' }
    ),
});

export const verifyResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required!' })
    .max(255, { message: 'Email is too long!' })
    .toLowerCase()
    .trim()
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      { message: 'Invalid email address!' }
    ),
  otp: z
    .string()
    .min(6, { message: 'OTP is required minimum 6 characters!' })
    .max(6, { message: 'OTP is too long!' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Password is required minimum 8 characters!' })
    .max(20, { message: 'Password is too long!' })
    .regex(/(?=.*[A-Za-z])/, {
      message: 'At least one small letter and one capital letter',
    })
    .regex(/(?=.*[0-9])/, { message: 'At least one number' })
    .regex(/(?=.*[!@#$%&*])/, { message: 'At least one special character' })
    .trim(),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
export type UsernameSchema = z.infer<typeof usernameSchema>;
