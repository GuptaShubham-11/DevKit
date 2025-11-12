import { User } from '@/models/user';
import { sendEmail } from '@/lib/email';
import { connectToDatabase } from '@/lib/db';
import { generateOtp } from '@/lib/generateOtp';
import { registerSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';
import { emailVerificationHtml } from '@/emails/emailVerification';

export async function POST(request: NextRequest) {
  try {
    const reqData = await request.json();

    const validatedData = registerSchema.safeParse(reqData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, username, password } = validatedData.data;
    await connectToDatabase();

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    // If verified user exists, stop
    if (existing?.isVerified) {
      return NextResponse.json(
        { error: 'Email or username already in use' },
        { status: 409 }
      );
    }

    // Generate OTP and expiry (15 minutes)
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // If user exists but not verified, update OTP
    if (existing) {
      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      existing.emailVerifiedAt = null; // reset
      await existing.save({ validateBeforeSave: false });
    } else {
      await User.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        otp,
        otpExpiry,
        isVerified: false,
      });
    }

    sendEmail({
      emailAddress: email.toLowerCase(),
      emailSubject: 'DevKit - Verify Your Account',
      htmlText: emailVerificationHtml(otp),
    });

    return NextResponse.json(
      { message: 'Verification code sent to your email.' },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Registration error:', err);
    return NextResponse.json(
      {
        error: 'Registration failed. Please try again.',
        details: error,
      },
      { status: 500 }
    );
  }
}
