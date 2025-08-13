import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { ITag, Tag } from '@/models/tag';
import { createTagSchema } from '@/validation/tag';
import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Validate input data
    const reqData = await request.json();
    const validated = createTagSchema.safeParse(reqData);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      color,
      category,
      isFeatured = false,
    } = validated.data;

    await connectToDatabase();

    // Check for existing tag (by name or slug)
    const existingTag = (await Tag.findOne({
      $or: [{ name }, { slug }],
    })) as ITag;
    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name or slug already exists' },
        { status: 400 }
      );
    }
    // Create and save tag
    const newTag = (await Tag.create({
      name,
      slug,
      description,
      color,
      category,
      isFeatured,
    })) as ITag;

    return NextResponse.json(
      { message: 'Tag created successfully', tag: newTag },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
