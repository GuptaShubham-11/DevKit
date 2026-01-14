import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { Category, ICategory } from '@/models/category';
import { connectToDatabase } from '@/lib/db';
import { createCategorySchema } from '@/validation/category';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const reqData = await request.json();
    const validatedData = createCategorySchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, slug, parentId, icon, sortOrder, metadata } =
      validatedData.data;

    await connectToDatabase();

    // Check if slug already exists
    const existingCategory = (await Category.findOne({
      slug: slug || generateSlug(name),
    })) as ICategory;

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate parent category exists if provided
    if (parentId) {
      const parentCategory = (await Category.findById(parentId)) as ICategory;
      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const newCategory = (await Category.create({
      name,
      description,
      slug: slug || generateSlug(name),
      parentId: parentId || null,
      icon,
      sortOrder: sortOrder || 0,
      metadata: metadata || {},
    })) as ICategory;

    if (parentId) {
      // Populate parent data for response
      await newCategory.populate('parentId', 'name slug');
    }

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category: newCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function checkUserIsAdmin(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  return user.isAdmin || false;
}
