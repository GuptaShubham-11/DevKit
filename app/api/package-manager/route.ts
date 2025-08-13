import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { IPackageManager, PackageManager } from '@/models/packageManager';
import { getPackageManagersSchema } from '@/validation/packageManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getPackageManagersSchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      includeInactive = false,
      platform,
      sort = 'popularity',
      order = 'desc',
      limit = 20,
      search,
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: {
      isActive?: boolean;
      supportedPlatforms?: { $in: string[] };
      $or?: any;
    } = {};

    if (!includeInactive) {
      conditions.isActive = true;
    }

    if (platform && platform !== 'all') {
      conditions.supportedPlatforms = { $in: [platform, 'all'] };
    }

    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortObj: {
      name?: 1 | -1;
      popularityScore?: 1 | -1;
      usageCount?: 1 | -1;
      createdAt?: 1 | -1;
    } = {};
    switch (sort) {
      case 'name':
        sortObj.name = order === 'desc' ? -1 : 1;
        break;
      case 'popularity':
        sortObj.popularityScore = order === 'desc' ? -1 : 1;
        sortObj.usageCount = -1; // Secondary sort
        break;
      case 'usage':
        sortObj.usageCount = order === 'desc' ? -1 : 1;
        break;
      case 'createdAt':
        sortObj.createdAt = order === 'desc' ? -1 : 1;
        break;
      default:
        sortObj.popularityScore = -1;
    }

    // Execute query
    const packageManagers = await PackageManager.find(conditions)
      .sort(sortObj)
      .limit(limit)
      .select('-metadata') // Exclude metadata from public API
      .lean();

    // Get statistics
    const totalCount = await PackageManager.countDocuments(conditions);
    const activeCount = await PackageManager.countDocuments({
      isActive: true,
    });

    // Get platform distribution
    const platformStats = (await PackageManager.aggregate([
      { $match: conditions },
      { $unwind: '$supportedPlatforms' },
      { $group: { _id: '$supportedPlatforms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])) as IPackageManager[];

    return NextResponse.json(
      {
        packageManagers: packageManagers,
        stats: {
          total: totalCount,
          active: activeCount,
          platforms: platformStats,
          mostPopular: packageManagers.slice(0, 3).map((pm) => ({
            name: pm.displayName,
            usageCount: pm.usageCount,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching package managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package managers' },
      { status: 500 }
    );
  }
}
