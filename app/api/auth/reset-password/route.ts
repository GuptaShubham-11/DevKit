import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { verifyResetPasswordSchema } from '@/validation/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = verifyResetPasswordSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp, password } = validatedData.data;

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found!' },
        { status: 404 }
      );
    }

    // Check OTP expiry first for better security response
    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: 'OTP expired or invalid, please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP matches exactly (case sensitive)
    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP!' },
        { status: 400 }
      );
    }

    // Hash new password securely before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user info securely
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: 'Password reset successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
