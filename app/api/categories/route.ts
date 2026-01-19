import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Category, ICategory } from '@/models/category';
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
      order,
      sort,
      search,
      parentId,
      treeStructure = 'false',
      includeInactive = false,
      limit = 50,
      offset = 0,
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: any = {};

    if (parentId) conditions.parentId = parentId;
    if (!includeInactive) conditions.isActive = true;
    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObject: any = {};

    switch (sort) {
      case 'name':
        sortObject.name = order === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortObject.createdAt = order === 'asc' ? 1 : -1;
        break;
      case 'clickCount':
        sortObject.clickCount = order === 'asc' ? 1 : -1;
        break;
      case 'templateCount':
        sortObject.templateCount = order === 'asc' ? 1 : -1;
        break;
      default:
        sortObject.createdAt = order === 'asc' ? 1 : -1;
        break;
    }

    // Execute query with population
    let query = Category.find(conditions)
      .sort({ sortOrder: 1, ...sortObject })
      .limit(limit)
      .skip(offset);

    // Populate parent category if needed
    if (parentId) query = query.populate('parentId', 'name slug');

    const categories = (await query.exec()) as ICategory[];

    // Get stats
    const total = await Category.countDocuments();
    const totalActive = await Category.countDocuments({
      isActive: true,
    });

    const [charts] = await Category.aggregate([
      { $match: conditions },
      {
        $facet: {
          topByTemplates: [
            { $sort: { templateCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                name: 1,
                templateCount: 1,
                color: 1,
                icon: 1,
              },
            },
          ],

          topByClicks: [
            { $sort: { clickCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                name: 1,
                clickCount: 1,
                color: 1,
                icon: 1,
              },
            },
          ],

          totalClickCount: [
            { $group: { _id: null, totalClickCount: { $sum: '$clickCount' } } },
          ],
        },
      },
    ]);

    // Build hierarchical structure if no parentId specified
    let result;
    if (!parentId && treeStructure === 'true')
      result = buildCategoryTree(categories);
    else result = categories;

    return NextResponse.json(
      {
        categories: result,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats: {
          totalCategories: total,
          totalActive,
          totalInactive: total - totalActive,
          totalClickCount: charts?.totalClickCount[0]?.totalClickCount || 0,
        },
        charts,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error },
      { status: 500 }
    );
  }
}

// Helper function to build category tree
function buildCategoryTree(
  categories: ICategory[],
  parentId: string | null = null
): ICategory[] {
  const tree: ICategory[] = [];

  for (const category of categories) {
    if (String(category.parentId) === String(parentId)) {
      const children = buildCategoryTree(categories, category._id.toString());
      const categoryObj = {
        ...category.toObject(),
        children: children.length > 0 ? children : undefined,
      };
      tree.push(categoryObj);
    }
  }

  return tree;
}
