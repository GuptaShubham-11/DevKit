import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { emailSchema } from '@/validation/auth';
import { sendEmail } from '@/lib/email';
import { resetPasswordHtml } from '@/emails/resetPassword';

export async function PATCH(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = emailSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, an OTP has been sent.' },
        { status: 200 }
      );
    }

    // Generate a secure OTP
    const otp = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    // Save OTP and expiration
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      emailAddress: email,
      emailSubject: 'DEVKIT - OTP for Password Reset',
      htmlText: resetPasswordHtml(otp),
    });

    return NextResponse.json(
      { message: 'If an account with that email exists, an OTP has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during forgot password process:', error);
    return NextResponse.json(
      { error: 'Forgot password process failed!' },
      { status: 500 }
    );
  }
}
