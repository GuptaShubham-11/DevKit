import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { usernameSchema } from '@/validation/auth';
import { NextResponse } from 'next/server';
import { generateUsername } from '@/lib/generateUsername';

export async function GET() {
  try {
    await connectToDatabase();
    const generatedUsername = await generateUsername();

    if (!generatedUsername) {
      return NextResponse.json(
        { error: 'Generating username failed!' },
        { status: 500 }
      );
    }

    let usernames = [];

    for (const username of generatedUsername) {
      const existingUser = await User.findOne({ username });
      if (!existingUser && usernameSchema.safeParse({ username }).success) {
        usernames.push(username);
      }
    }

    return NextResponse.json(
      { message: 'Generated username.', usernames },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating username:', error);
    return NextResponse.json(
      { error: 'Generating username failed!' },
      { status: 500 }
    );
  }
}
