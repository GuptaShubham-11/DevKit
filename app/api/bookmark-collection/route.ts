import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { BookmarkCollection } from '@/models/bookmarkCollection';
import { createCollectionSchema } from '@/validation/bookmark';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reqData = await request.json();
    const validatedData = createCollectionSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already has a collection with this name
    const existingCollection = await BookmarkCollection.findOne({
      userId: session.user.id,
      name: validatedData.data.name,
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: 'Collection name already exists' },
        { status: 409 }
      );
    }

    const collection = await BookmarkCollection.create({
      ...validatedData.data,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        message: 'Collection created successfully',
        collection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const collections = await BookmarkCollection.find({
      userId: session.user.id,
    })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
