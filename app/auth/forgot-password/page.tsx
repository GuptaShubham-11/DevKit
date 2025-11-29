'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mail, Lock, ArrowLeft, RotateCw, EyeOff, Eye } from 'lucide-react';

import CustomButton from '@/components/CustomButton';
import { LabelInput } from '@/components/LabelInput';
import { InputOtp } from '@/components/auth/InputOtp';

import {
  useRequestOtp,
  useRequestOtpLoading,
  useResetPassword,
  useResetPasswordError,
  useResetPasswordLoading,
} from '@/store/auth';

import {
  RequestOtpData,
  requestOtpSchema,
  ResetPasswordData,
  resetPasswordSchema,
} from '@/validation/auth';

const OTP_LENGTH = 6;
const RESEND_TIMER_SECONDS = 30;

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestOtp = useRequestOtp();
  const resetPassword = useResetPassword();
  const requestOtpLoading = useRequestOtpLoading();
  const resetPasswordError = useResetPasswordError();
  const resetPasswordLoading = useResetPasswordLoading();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resendTimer, setResendTimer] = useState(RESEND_TIMER_SECONDS);

  // Step 1: Request OTP form
  const {
    register: registerRequestOtp,
    handleSubmit: handleSubmitRequestOtp,
    formState: { errors: errorsRequestOtp, isValid: isValidRequestOtp },
  } = useForm<RequestOtpData>({
    resolver: zodResolver(requestOtpSchema),
    mode: 'onChange',
    defaultValues: {
      email,
      type: 'resetPassword',
    },
  });

  // Step 2: Reset Password form
  const {
    register: registerResetPassword,
    setValue: setValueResetPassword,
    handleSubmit: handleSubmitResetPassword,
    formState: { errors: errorsResetPassword, isValid: isValidResetPassword },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const handleRequestOtp = async (values: RequestOtpData) => {
    const success = await requestOtp(values.email, 'resetPassword');
    if (success) {
      setStep(2);
      setEmail(values.email);
      setValueResetPassword('email', values.email);
      setResendTimer(RESEND_TIMER_SECONDS);
    }
  };

  const handleResetPassword = async (values: ResetPasswordData) => {
    const success = await resetPassword(email, values.otp, values.newPassword);
    if (success) {
      router.push('/auth/login');
    }
  };

  const handleResendOtp = async () => {
    await handleRequestOtp({ email, type: 'resetPassword' });
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timerId = window.setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [resendTimer]);

  const canResendOtp = resendTimer === 0 && !requestOtpLoading;

  return (
    <section
      id="forgotPassword"
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
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="text-sm text-text-muted">
              {step === 1
                ? 'Enter your email address to receive a code.'
                : `We sent a ${OTP_LENGTH}-digit code to `}
              {step === 2 && (
                <span className="text-text-secondary">{email}</span>
              )}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              // Step 1: Request OTP
              <motion.form
                key="request-otp"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onSubmit={handleSubmitRequestOtp(handleRequestOtp)}
                className="space-y-1"
                noValidate
              >
                <motion.div variants={itemVariants}>
                  <LabelInput
                    label="Email Address"
                    placeholder="you@example.com"
                    type="email"
                    error={errorsRequestOtp.email?.message}
                    iconLeft={Mail}
                    {...registerRequestOtp('email')}
                  />
                </motion.div>

                <CustomButton
                  type="submit"
                  label="Send Code"
                  variant="main"
                  loading={requestOtpLoading}
                  disabled={!isValidRequestOtp || requestOtpLoading}
                  shimmer
                  className="mt-6 w-full"
                />
              </motion.form>
            ) : (
              // Step 2: Reset Password
              <motion.div
                key="reset-password"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-1"
              >
                {/* OTP */}
                <motion.div variants={itemVariants}>
                  <InputOtp
                    length={OTP_LENGTH}
                    onComplete={(otp) => setValueResetPassword('otp', otp)}
                    error={Boolean(resetPasswordError)}
                  />
                </motion.div>

                {/* New Password */}
                <motion.div className="relative" variants={itemVariants}>
                  <LabelInput
                    label="New Password"
                    placeholder="••••••••"
                    type="password"
                    error={errorsResetPassword.newPassword?.message}
                    iconLeft={Lock}
                    {...registerResetPassword('newPassword')}
                    autoComplete="new-password"
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

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-2">
                  <CustomButton
                    type="button"
                    label="Back"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="w-[120px] flex-1"
                  />
                  <CustomButton
                    type="submit"
                    onClick={handleSubmitResetPassword(handleResetPassword)}
                    label="Reset Password"
                    variant="main"
                    loading={resetPasswordLoading}
                    disabled={!isValidResetPassword || resetPasswordLoading}
                    shimmer
                  />
                </motion.div>

                {/* Resend OTP */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-sm text-text-muted mt-4"
                >
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResendOtp}
                    className="font-medium text-text-secondary transition-colors hover:text-accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestOtpLoading ? (
                      <>
                        <RotateCw className="mr-1 inline size-4 animate-spin" />
                        Resending...
                      </>
                    ) : resendTimer > 0 ? (
                      `Resend in ${resendTimer}s`
                    ) : (
                      'Resend'
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
