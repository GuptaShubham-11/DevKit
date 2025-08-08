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
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    user.otp = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0'); // Generate a random 6-digit OTP
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Set OTP expiry to 15 minutes from now
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      emailAddress: email,
      emailSubject: 'DEVKIT - Otp For Reset Password',
      htmlText: resetPasswordHtml(user.otp),
    });

    return NextResponse.json(
      { message: 'OTP sent successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error forgot password', error);
    return NextResponse.json(
      { error: 'Forgot password failed!' },
      { status: 500 }
    );
  }
}
