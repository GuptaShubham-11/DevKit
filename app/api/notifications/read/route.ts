import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Notification } from '@/models/notification';
import { markReadSchema } from '@/validation/notification';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const req = await request.json();
    const validated = markReadSchema.safeParse(req);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { notificationIds } = validated.data;
    await connectToDatabase();

    // Update only notifications belonging to user
    const result: { nModified?: number; modifiedCount?: number } =
      await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: session.user.id,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

    return NextResponse.json(
      {
        message: 'Notifications marked as read',
        modifiedCount: result.nModified ?? result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
