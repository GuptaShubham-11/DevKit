import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { verifyResetPasswordSchema } from '@/validation/auth';

export async function PUT(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = verifyResetPasswordSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, otp, password } = validatedData.data;

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    if (user.otp === otp && user.otpExpiry > new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      user.password = password;
      await user.save({ validateBeforeSave: false });
      return NextResponse.json(
        { message: 'Password reset successfully.' },
        { status: 200 }
      );
    } else if (user.otpExpiry < new Date()) {
      return NextResponse.json({ error: 'OTP expired!' }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Invalid OTP!' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error resetting password', error);
    return NextResponse.json(
      { error: 'Resetting password failed' },
      { status: 500 }
    );
  }
}
