import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/category';
import { updateCategorySchema } from '@/validation/category';
import { isValidObjectId } from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Props {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    // Validation
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          error: 'Invalid category ID',
          details: 'Category ID must be a valid ObjectId',
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const [category, childCategories] = await Promise.all([
      Category.findById(id),
      Category.countDocuments({ parentId: id }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (childCategories > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with subcategories',
          details: `This category has ${childCategories} subcategories. Please delete or reassign them first.`,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Category deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          error: 'Invalid category ID',
          details: 'Category ID must be a valid ObjectId',
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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
    const validatedData = updateCategorySchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validatedData.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    const [existingCategory, slugConflict, parentCategory] = await Promise.all([
      Category.findById(id),
      data.slug
        ? Category.findOne({ slug: data.slug, _id: { $ne: id } })
        : null,
      data.parentId ? Category.findById(data.parentId) : null,
    ]);

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    if (data.parentId && !parentCategory) {
      return NextResponse.json(
        { error: 'Parent category not found' },
        { status: 400 }
      );
    }

    if (data.parentId === id) {
      return NextResponse.json(
        { error: 'Category cannot be its own parent' },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('parentId', 'name slug');

    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category', details: error },
      { status: 500 }
    );
  }
}
