import { connectToDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/user';
import { registerSchema } from '@/validation/auth';

export async function POST(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = registerSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, username, password } = validatedData.data;

    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        {
          error: 'User already exists!',
        },
        { status: 400 }
      );
    } else if (existingUser && !existingUser.isVerified) {
      existingUser.username = username;
      existingUser.email = email;
      existingUser.password = password;
      await existingUser.save({ validateBeforeSave: false });
      return NextResponse.json(
        {
          error: 'User already exists! Please verify your email through login.',
        },
        { status: 400 }
      );
    }

    await User.create({
      email,
      username,
      password,
    });

    return NextResponse.json(
      {
        message: 'User registered.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error registering user: ', error);
    return NextResponse.json(
      {
        error: 'Failed to register user!',
      },
      { status: 500 }
    );
  }
}
