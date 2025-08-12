import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category } from '@/models/category';
import { getCategoriesSchema } from '@/validation/category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getCategoriesSchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      parentId,
      includeInactive = false,
      limit = 50,
      offset = 0,
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: any = {};

    if (parentId) {
      conditions.parentId = parentId;
    }

    if (!includeInactive) {
      conditions.isActive = true;
    }

    // Execute query with population
    let query = Category.find(conditions)
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .skip(offset);

    // Populate parent category if needed
    if (!parentId) {
      query = query.populate('parentId', 'name slug');
    }

    const categories = await query.exec();

    // Get total count for pagination
    const total = await Category.countDocuments(conditions);

    // Build hierarchical structure if no parentId specified
    let result;
    if (!parentId) {
      result = buildCategoryTree(categories);
    } else {
      result = categories;
    }

    return NextResponse.json(
      {
        categories: result,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Helper function to build category tree
function buildCategoryTree(
  categories: any[],
  parentId: string | null = null
): any[] {
  const tree: any[] = [];

  for (const category of categories) {
    if (String(category.parentId) === String(parentId)) {
      const children = buildCategoryTree(categories, category._id);
      const categoryObj = {
        ...category.toObject(),
        children: children.length > 0 ? children : undefined,
      };
      tree.push(categoryObj);
    }
  }

  return tree;
}
