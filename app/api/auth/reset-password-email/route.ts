import { User } from '@/models/user';
import { sendEmail } from '@/lib/email';
import { connectToDatabase } from '@/lib/db';
import { generateOtp } from '@/lib/generateOtp';
import { requestOtpSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordHtml } from '@/emails/resetPassword';

export async function PATCH(request: NextRequest) {
  try {
    const reqData = await request.json();

    const validatedData = requestOtpSchema.safeParse(reqData);
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
        {
          message:
            'If an account with that email exists, an OTP has been sent.',
        },
        { status: 200 }
      );
    }

    const otp = generateOtp();

    // Save OTP and expiration
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      emailAddress: email,
      emailSubject: 'DevKit - OTP for Password Reset',
      htmlText: resetPasswordHtml(otp),
    });

    return NextResponse.json(
      {
        message: 'If an account with that email exists, an OTP has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error during forgot password process:', error);
    return NextResponse.json(
      {
        error: 'Forgot password process failed!',
        details: error,
      },
      { status: 500 }
    );
  }
}
