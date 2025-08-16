import { connectToDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import { registerSchema } from '@/validation/auth';
import { sendEmail } from '@/lib/email';
import { emailVerificationHtml } from '@/emails/emailVerification';
import { generateOtp } from '@/lib/generateOtp';

export async function POST(request: NextRequest) {
  const reqData = await request.json().catch(() => null);
  if (!reqData) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(reqData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, username, password } = parsed.data;

  try {
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
      emailSubject: 'DEVKIT - Verify Your Account',
      htmlText: emailVerificationHtml(otp),
    });

    return NextResponse.json(
      { message: 'Verification code sent to your email.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
