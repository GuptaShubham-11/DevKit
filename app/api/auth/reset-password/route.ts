import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/validation/auth';

export async function PUT(request: NextRequest) {
  try {
    const reqData = await request.json().catch(() => null);

    if (!reqData) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validated = resetPasswordSchema.safeParse(reqData);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, otp, newPassword } = validated.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Email not found!' }, { status: 404 });
    }

    // Check OTP expiration
    const now = new Date();
    if (!user.otp || !user.otpExpiry || user.otpExpiry < now) {
      return NextResponse.json(
        { error: 'OTP expired or invalid. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    user.password = newPassword;

    // Clear OTP and expiry
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Reset login attempts and locks for security
    user.loginAttempts = 0;
    user.lockedUntil = undefined;

    // Save user without validating unrelated fields
    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
