'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import CustomButton from '@/components/CustomButton';
import { LabelInput } from '@/components/LabelInput';
import { LoginData, loginSchema } from '@/validation/auth';
import { useLogin, useLoginLoading } from '@/store/auth';

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

export default function LoginPage() {
  const router = useRouter();
  const loginUser = useLogin();
  const loginLoading = useLoginLoading();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  const onSubmit = async (values: LoginData) => {
    const response = await loginUser(values.email, values.password);
    if (response?.ok) {
      router.push('/dashboard');
    }
  };

  const isFormValid = Boolean(isValid && watchedEmail && watchedPassword);

  return (
    <section
      id="login"
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
              Login to your account
            </h2>
            <p className="text-sm text-text-muted">Welcome Back!</p>
          </div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-1"
            noValidate
          >
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

              <span className="absolute right-1 top-2 -translate-y-1/2">
                <Link
                  href="/auth/forgot-password"
                  className="text-[12px] cursor-pointer font-semibold tracking-wider text-text-muted opacity-80 hover:text-text-secondary hover:underline"
                >
                  Forgot Password
                </Link>
              </span>
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={itemVariants}
              className="mt-8 grid grid-cols-2 gap-4"
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
                type="submit"
                label="Login"
                variant="main"
                loading={loginLoading}
                disabled={!isFormValid || loginLoading}
                shimmer
                className="font-medium"
              />
            </motion.div>

            <span className="mt-4 flex items-center justify-center gap-1 text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="cursor-pointer font-medium text-text-secondary hover:text-accent-primary hover:underline"
              >
                Register
              </Link>
            </span>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}
