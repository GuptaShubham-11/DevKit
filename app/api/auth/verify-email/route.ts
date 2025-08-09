import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { verifyOtpSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = verifyOtpSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email already verified!' },
        { status: 200 }
      );
    }

    // Validate OTP expiry and OTP match
    const now = new Date();
    if (!user.otp || !user.otpExpiry || user.otpExpiry < now) {
      return NextResponse.json(
        { error: 'OTP expired or invalid, please request a new code.' },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP!' }, { status: 400 });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return NextResponse.json(
      { message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Verification failed due to server error.' },
      { status: 500 }
    );
  }
}
