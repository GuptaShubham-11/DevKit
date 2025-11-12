import { User } from '@/models/user';
import { connectToDatabase } from '@/lib/db';
import { usernameSchema } from '@/validation/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const usernameParam = request.nextUrl.searchParams.get('username');

    if (!usernameParam) {
      return NextResponse.json(
        { erroror: 'Username query parameter is required.' },
        { status: 400 }
      );
    }

    // Validate and normalize username
    const validatedData = usernameSchema.safeParse(usernameParam);
    if (!validatedData.success) {
      return NextResponse.json(
        { erroror: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }
    const username = validatedData.data;
    await connectToDatabase();

    // Case-insensitive lookup
    const existingUser = await User.findOne({ username })
      .collation({
        locale: 'en',
        strength: 2,
      })
      .lean();

    if (existingUser) {
      return NextResponse.json(
        { available: false, message: 'Username already taken.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { available: true, message: 'Username is available.' },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error checking username:', error);
    return NextResponse.json(
      {
        error: 'Failed to check username availability.',
        details: error,
      },
      { status: 500 }
    );
  }
}
