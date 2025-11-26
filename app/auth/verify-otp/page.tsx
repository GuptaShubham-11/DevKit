'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import CustomButton from '@/components/CustomButton';
import { InputOtp } from '@/components/auth/InputOtp';

import {
  useVerifyOtp,
  useRequestOtp,
  useVerifyOtpLoading,
  useRequestOtpLoading,
  useVerifyOtpError,
} from '@/store/auth';
import Loader from '@/components/Loader';

const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const verifyOtp = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const verifyOtpError = useVerifyOtpError();
  const isSubmitting = useVerifyOtpLoading();
  const isResending = useRequestOtpLoading();

  const [otp, setOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(RESEND_SECONDS);

  const hasEmail = Boolean(email);

  const handleVerifyOtp = async () => {
    if (!email || email != '') {
      toast.error('Email address is missing');
      return;
    }

    if (otp.length != OTP_LENGTH) {
      toast.error(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    const success = await verifyOtp(email, otp);

    if (!success) {
      setOtp('');
      return;
    }

    router.push('/auth/login');
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResendTimer(RESEND_SECONDS);
    await requestOtp(email, 'register');
  };

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timerId = window.setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [resendTimer]);

  return (
    <section
      id="verifyOtp"
      className=" flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary font-sans"
    >
      <div className="absolute top-4 left-2">
        <CustomButton
          label="Change Email"
          onClick={() => router.push('/auth/register')}
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
          {hasEmail ? (
            <>
              <div className="mb-6 space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                  Verify your account
                </h2>
                <p className="text-sm text-text-muted">
                  We sent a {OTP_LENGTH}-digit code to{' '}
                  <span className="text-text-secondary">{email}</span>
                </p>
              </div>

              <InputOtp
                length={OTP_LENGTH}
                onComplete={setOtp}
                error={verifyOtpError !== null}
              />

              <CustomButton
                onClick={handleVerifyOtp}
                disabled={isSubmitting || otp.length !== OTP_LENGTH}
                className="w-full"
                label="Verify Account"
                loading={isSubmitting}
                variant="main"
                shimmer={true}
                type="submit"
              />

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-3 flex items-center justify-center gap-1"
              >
                <p className="text-sm text-text-muted">
                  Didn't receive the Otp?
                </p>

                <Button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResending}
                  variant="ghost"
                  className="m-0 cursor-pointer bg-transparent p-0 text-text-secondary hover:bg-transparent hover:text-text-primary"
                >
                  {isResending ? (
                    <Loader />
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </motion.div>

              <p className="mt-2 text-xs text-text-muted">
                <span className="font-semibold text-accent-warning">NOTE:</span>{' '}
                Check your <b className="text-text-secondary">spam folder</b> if
                you cannot find the email.
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ rotate: -90, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="mb-6"
              >
                <TriangleAlert
                  className="mx-auto rounded-[2px] border border-border-color bg-surface-secondary p-3 text-accent-error"
                  size={56}
                />
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center text-2xl font-semibold text-text-secondary"
              >
                Registration Required
              </motion.h2>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 text-center text-text-muted"
              >
                You cannot access this page without registering!
              </motion.p>

              <CustomButton
                onClick={() => router.push('/auth/register')}
                className="w-full"
                label="Go To Register"
                variant="ghost"
              />
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
