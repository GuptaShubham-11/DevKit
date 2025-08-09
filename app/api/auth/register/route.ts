import { connectToDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import { registerSchema } from '@/validation/auth';
import { sendEmail } from '@/lib/email';
import { emailVarificationHtml } from '@/emails/emailVarification';

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

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // User is already registered and verified
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { error: 'User already exists!' },
        { status: 400 }
      );
    }

    const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // User exists, but is not verified
    if (existingUser && !existingUser.isVerified) {
      // Only update the OTP and expiry
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save({ validateBeforeSave: false });

      await sendEmail({
        emailAddress: existingUser.email,
        emailSubject: 'DEVKIT - Verify Your Account',
        htmlText: emailVarificationHtml(otp),
      });

      return NextResponse.json(
        {
          message: 'A verification code has been sent to your email address.',
        },
        { status: 200 }
      );
    }

    await User.create({
      email,
      username,
      password,
      otp,
      otpExpiry,
    });

    await sendEmail({
      emailAddress: email,
      emailSubject: 'DEVKIT - Verify Your Account',
      htmlText: emailVarificationHtml(otp),
    });

    return NextResponse.json(
      { message: 'A verification code has been sent to your email address.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error registering user: ', error);
    return NextResponse.json(
      { error: 'Failed to register user!' },
      { status: 500 }
    );
  }
}
