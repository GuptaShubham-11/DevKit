import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Comment } from '@/models/comment';
import { deleteCommentSchema, updateCommentSchema } from '@/validation/comment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Props {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const reqData = await request.json();
    const validated = updateCommentSchema.safeParse(reqData);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const { commentText } = validated.data;

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { commentText },
      { new: true }
    );

    return NextResponse.json(
      {
        message: 'Comment updated successfully',
        data: updatedComment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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

    await connectToDatabase();
    const validatedData = deleteCommentSchema.safeParse(params);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { commentId } = validatedData.data;
    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      userId: session.user.id,
    });
    return NextResponse.json(
      { message: 'Comment deleted successfully', data: deletedComment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
