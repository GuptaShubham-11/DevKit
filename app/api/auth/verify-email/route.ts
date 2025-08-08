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
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, otp } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    if (!user.isVerified) {
      if (user.otp === otp && user.otpExpiry > new Date()) {
        user.isVerified = true;
        await user.save();
        return NextResponse.json(
          { message: 'Email verified.' },
          { status: 200 }
        );
      } else if (user.otpExpiry < new Date()) {
        return NextResponse.json({ error: 'OTP expired!' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Invalid OTP!' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { message: 'Email already verified!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying email', error);
    return NextResponse.json(
      { error: 'Verification failed!' },
      { status: 500 }
    );
  }
}
