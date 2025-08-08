import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/validation/auth';
import { sendEmail } from '@/lib/email';
import { emailVarificationHtml } from '@/emails/emailVarification';

export async function POST(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = loginSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid password!' }, { status: 401 });
    }

    if (!user.isVerified) {
      user.otp = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0'); // Generate a random 6-digit OTP
      user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Set OTP expiry to 15 minutes from now
      await user.save({ validateBeforeSave: false });

      await sendEmail({
        emailAddress: email,
        emailSubject: 'DEVKIT - Verify Your Account',
        htmlText: emailVarificationHtml(user.otp),
      });

      return NextResponse.json(
        { message: 'Please verify your email.', user },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Login successful.', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logging in', error);
    return NextResponse.json({ error: 'Loggin failed!' }, { status: 500 });
  }
}
