import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { usernameSchema } from '@/validation/auth';
import { NextResponse } from 'next/server';
import { generateUsername } from '@/lib/generateUsername';

export async function GET() {
  try {
    await connectToDatabase();

    const generatedUsernames: string[] | null = await generateUsername();

    if (!generatedUsernames || !Array.isArray(generatedUsernames) || generatedUsernames.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate usernames!' },
        { status: 500 }
      );
    }

    const validUsernames = generatedUsernames.filter((uname) =>
      usernameSchema.safeParse({ username: uname }).success
    );

    if (validUsernames.length === 0) {
      return NextResponse.json(
        { error: 'No valid usernames generated!' },
        { status: 500 }
      );
    }

    const existingUsers = await User.find({
      username: { $in: validUsernames },
    }).select('username');

    // Extract existing usernames for quick lookup
    const existingUsernamesSet = new Set(existingUsers.map((user) => user.username));

    // Filter out usernames that already exist
    const availableUsernames = validUsernames.filter((uname) => !existingUsernamesSet.has(uname));

    if (availableUsernames.length === 0) {
      return NextResponse.json(
        { error: 'No available usernames found!' },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { usernames: availableUsernames },
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
