import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { usernameSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const reqData = await request.json();
    const validatedData = usernameSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { username } = validatedData.data;

    await connectToDatabase();

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists!' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Username available.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking username', error);
    return NextResponse.json(
      { error: 'Checking username failed' },
      { status: 500 }
    );
  }
}
