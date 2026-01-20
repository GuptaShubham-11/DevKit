import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/models/category';
import { connectToDatabase } from '@/lib/db';
import { createCategorySchema } from '@/validation/category';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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

    const reqData = await request.json();
    const validatedData = createCategorySchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      slug,
      parentId,
      icon,
      sortOrder,
      metadata,
      color,
      isActive,
      featuredTemplates,
      clickCount,
      templateCount,
    } = validatedData.data;

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check slug uniqueness
    const existingCategory = await Category.findOne({ slug: finalSlug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    // Validate parent exists
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Create category
    const newCategory = await Category.create({
      name,
      description: description || '',
      slug: finalSlug,
      parentId: parentId || null,
      icon: icon || 'CircleQuestionMark',
      sortOrder: sortOrder ?? 0,
      metadata: metadata || {},
      color: color || '#64748b',
      isActive: isActive ?? true,
      featuredTemplates: featuredTemplates || [],
      clickCount: clickCount ?? 0,
      templateCount: templateCount ?? 0,
    });

    if (parentId) {
      await newCategory.populate('parentId', 'name slug color icon');
    }

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
