import { Badge } from '@/models/badge';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { updateBadgeSchema } from '@/validation/badge';
import { NextRequest, NextResponse } from 'next/server';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

interface Props {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check admin permissions
    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const badge = await Badge.findByIdAndDelete(id);
    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Badge deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error deleteing badge:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete badge',
        details: error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const reqData = await request.json();
    const validated = updateBadgeSchema.safeParse(reqData);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const badge = await Badge.findByIdAndUpdate(id, validated.data, {
      new: true,
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Badge updated successfully',
        badge,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error updateing badge:', error);
    return NextResponse.json(
      {
        error: 'Failed to update badge',
        details: error,
      },
      { status: 500 }
    );
  }
}
