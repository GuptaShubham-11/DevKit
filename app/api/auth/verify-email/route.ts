import { connectToDatabase } from '@/lib/db';
import { Notification } from '@/models/notification';
import { User } from '@/models/user';
import { verifyOtpSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const reqData = await request.json().catch(() => null);

    if (!reqData) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate input
    const parsed = verifyOtpSchema.safeParse(reqData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, otp } = parsed.data;

    await connectToDatabase();

    // Lookup user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }

    const now = new Date();

    // Check OTP expiry
    if (!user.otp || !user.otpExpiry || user.otpExpiry < now) {
      return NextResponse.json(
        { error: 'OTP expired or invalid. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check OTP match
    if (user.otp !== otp) {
      // Increment loginAttempts to deter brute-force
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.emailVerifiedAt = now;
    await user.save({ validateBeforeSave: false });

    await Notification.create({
      userId: user.id,
      type: 'welcome',
      title: 'Welcome to DevKit!',
      message: 'Welcome to DevKit! Your email has been verified.',
    });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email!' },
      { status: 400 }
    );
  }
}
