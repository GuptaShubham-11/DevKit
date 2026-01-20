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

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'name':
        sortObj.name = order === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortObj.createdAt = order === 'asc' ? 1 : -1;
        break;
      case 'clickCount':
        sortObj.clickCount = order === 'asc' ? 1 : -1;
        break;
      case 'templateCount':
        sortObj.templateCount = order === 'asc' ? 1 : -1;
        break;
      default:
        sortObj.createdAt = order === 'asc' ? 1 : -1;
        break;
    }

    // Main query
    const query = Category.find(conditions)
      .sort({ sortOrder: 1, ...sortObj })
      .limit(limit)
      .skip(offset);

    // Populate parent if needed
    if (parentId) {
      query.populate('parentId', 'name slug');
    }

    const categories = await query.exec();

    // Stats
    const [total, totalActive] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
    ]);

    // Charts aggregation
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

    // Build tree structure if requested and no parent filter
    const result =
      !parentId && treeStructure === 'true'
        ? buildCategoryTree(categories as ICategory[])
        : categories;

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

// Build hierarchical category tree
function buildCategoryTree(categories: ICategory[]): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];

  // Create map and populate children
  for (const category of categories) {
    const obj = category.toObject();
    const node = { ...obj, children: [] };
    map.set(obj._id.toString(), node);

    if (obj.parentId) {
      const parent = map.get(obj.parentId.toString());
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Clean empty children arrays
  const clean = (nodes: any[]): any[] =>
    nodes.map((node) => {
      if (node.children?.length) {
        node.children = clean(node.children);
      } else {
        delete node.children;
      }
      return node;
    });

  return clean(roots);
}
