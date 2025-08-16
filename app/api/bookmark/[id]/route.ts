import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Bookmark } from '@/models/bookmark';
import { updateBookmarkSchema } from '@/validation/bookmark';
import { authOptions } from '@/lib/auth';
import { BookmarkCollection } from '@/models/bookmarkCollection';

interface Props {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid bookmark ID' },
        { status: 400 }
      );
    }

    const reqData = await request.json();
    const validatedData = updateBookmarkSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bookmark = await Bookmark.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found!' },
        { status: 404 }
      );
    }

    // Update bookmark fields
    const updateData: any = validatedData.data;
    Object.keys(updateData).forEach((key: string) => {
      if (key === 'priority') {
        bookmark.metadata[key] = updateData[key];
      } else {
        bookmark[key] = updateData[key];
      }
    });

    await bookmark.save();

    // Populate for response
    await bookmark.populate([
      { path: 'templateId', select: 'name description creatorId status viewsCount likesCount copiesCount' },
      { path: 'collectionId', select: 'name color icon' },
    ]);

    return NextResponse.json(
      {
        message: 'Bookmark updated successfully',
        bookmark,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid bookmark ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bookmark = await Bookmark.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // Update collection count if bookmark was in a collection
    if (bookmark.collectionId) {
      await BookmarkCollection.findByIdAndUpdate(bookmark.collectionId, {
        $inc: { bookmarkCount: -1 },
      });
    }

    await Bookmark.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: 'Bookmark deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
