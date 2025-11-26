'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { motion, Variants } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import { Checkbox } from '@/components/Checkbox';
import CustomButton from '@/components/CustomButton';
import { LabelInput } from '@/components/LabelInput';
import { registerSchema, RegisterData } from '@/validation/auth';

import {
  useUsernameCheck,
  useRegister,
  useRegisterLoading,
  useCheckUsernameLoading,
  useCheckUsername,
  useClearUsernameCheck,
} from '@/store/auth';

import {
  Eye,
  User,
  Mail,
  Lock,
  Check,
  EyeOff,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function RegisterPage() {
  const router = useRouter();

  const registerUser = useRegister();
  const usernameCheck = useUsernameCheck();
  const checkUsername = useCheckUsername();
  const registerLoading = useRegisterLoading();
  const clearUsernameCheck = useClearUsernameCheck();
  const checkUsernameLoading = useCheckUsernameLoading();

  const [showPw, setShowPw] = useState(false);
  const [isConditionAccepted, setIsConditionAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedUsername = watch('username');

  // Debounced username availability check
  useEffect(() => {
    if (!watchedUsername) {
      clearUsernameCheck();
      return;
    }

    const trimmed = watchedUsername.trim();
    if (trimmed.length < 3) {
      clearUsernameCheck();
      return;
    }

    const timerId = window.setTimeout(() => {
      void checkUsername(trimmed);
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [watchedUsername, checkUsername, clearUsernameCheck]);

  const onSubmit = async (values: RegisterData) => {
    const success = await registerUser(
      values.username,
      values.email,
      values.password
    );

    if (success) {
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
    }
  };

  const isUsernameAvailable = Boolean(usernameCheck?.available);
  const isFormValid =
    isValid &&
    !checkUsernameLoading &&
    isUsernameAvailable &&
    isConditionAccepted;

  return (
    <section
      id="register"
      className="flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary font-sans"
    >
      <div className="absolute left-2 top-4">
        <CustomButton
          label="Home"
          onClick={() => router.push('/')}
          icon={ArrowLeft}
          variant="ghost"
          className="w-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="absolute inset-0 rounded-[2px] border border-border-color bg-surface-primary/60 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl" />
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-50" />

        <div className="relative p-8">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              Create your account
            </h2>
            <p className="text-sm text-text-muted">No clutter. Focused flow.</p>
          </div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-1"
            noValidate
          >
            {/* Username */}
            <motion.div variants={itemVariants}>
              <LabelInput
                label="Username"
                placeholder="devwizard"
                error={errors.username?.message}
                iconLeft={User}
                iconRight={
                  checkUsernameLoading ? (
                    <Loader2 className="size-4 animate-spin text-accent-warning" />
                  ) : usernameCheck && usernameCheck.available ? (
                    <Check className="size-4 text-accent-success" />
                  ) : undefined
                }
                {...register('username')}
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <LabelInput
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                error={errors.email?.message}
                iconLeft={Mail}
                {...register('email')}
              />
            </motion.div>

            {/* Password */}
            <motion.div className="relative" variants={itemVariants}>
              <LabelInput
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••"
                error={errors.password?.message}
                iconLeft={Lock}
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-10 -translate-y-1/2 text-text-muted"
                onClick={() => setShowPw((prev) => !prev)}
              >
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div variants={itemVariants} className="mb-4">
              <Checkbox
                label={
                  <span className="text-text-secondary/80">
                    I agree to the{' '}
                    <a
                      href="#"
                      className="text-text-primary transition-colors hover:text-accent-primary hover:underline"
                    >
                      Terms
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-text-primary transition-colors hover:text-accent-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                }
                checked={isConditionAccepted}
                onChange={(e) => setIsConditionAccepted(e.target.checked)}
                required
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <CustomButton
                type="button"
                svg
                label="Google"
                variant="secondary"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="font-medium"
              />

              <CustomButton
                onClick={handleSubmit(onSubmit)}
                type="submit"
                label="Create Account"
                variant="main"
                loading={registerLoading}
                disabled={!isFormValid || registerLoading}
                shimmer
                className="font-medium"
              />
            </motion.div>

            <span className="mt-4 flex items-center justify-center gap-1 text-sm text-text-muted">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="cursor-pointer font-medium text-text-secondary hover:text-accent-primary hover:underline"
              >
                Login
              </Link>
            </span>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}
