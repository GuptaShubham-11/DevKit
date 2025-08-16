import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { UserActivity } from '@/models/userActivities';
import { User } from '@/models/user';
import { authOptions } from '@/lib/auth';
import { getActivitiesSchema } from '@/validation/activities';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getActivitiesSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      userId,
      templateId,
      activityType,
      days = 30,
      limit = 50,
      offset = 0,
      includeAnonymous = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = validation.data;

    await connectToDatabase();

    // Authorization checks
    if (userId && userId !== session?.user?.id) {
      // Check if requesting user is admin
      const requestingUser = (await User.findById(session?.user?.id)
        .select('isAdmin')
        .lean()) as any;
      if (!requestingUser?.isAdmin) {
        return NextResponse.json(
          { error: "Access denied: Cannot view other users' activities" },
          { status: 403 }
        );
      }
    }

    // Build query conditions
    const conditions: Record<string, any> = {};

    // Date range filter
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      conditions.createdAt = { $gte: startDate };
    }

    // User filter
    if (userId) {
      conditions.userId = new mongoose.Types.ObjectId(userId);
    } else if (session && !includeAnonymous) {
      conditions.userId = new mongoose.Types.ObjectId(session.user.id);
    }

    // Template filter
    if (templateId) {
      conditions.templateId = new mongoose.Types.ObjectId(templateId);
    }

    // Activity type filter
    if (activityType) {
      conditions.activityType = activityType;
    }

    // Anonymous users filter
    if (!includeAnonymous && !userId) {
      conditions.userId = { $ne: null };
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    if (sortBy !== 'createdAt') {
      sortObj.createdAt = -1; // Secondary sort
    }

    // Execute queries with error handling
    const [activities, total, activityStats] = await Promise.all([
      UserActivity.find(conditions)
        .populate('userId', 'username profileImage')
        .populate('templateId', 'name description creatorId status')
        .sort(sortObj)
        .limit(limit)
        .skip(offset)
        .lean()
        .catch((err) => {
          console.error('Activities query error:', err);
          return [];
        }),

      UserActivity.countDocuments(conditions).catch((err) => {
        console.error('Count query error:', err);
        return 0;
      }),

      UserActivity.aggregate([
        { $match: conditions },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueTemplates: { $addToSet: '$templateId' },
          },
        },
        {
          $project: {
            activityType: '$_id',
            count: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            uniqueTemplates: { $size: '$uniqueTemplates' },
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
      ]).catch((err) => {
        console.error('Stats aggregation error:', err);
        return [];
      }),
    ]);

    // Calculate pagination info
    const hasMore = offset + limit < total;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          limit,
          offset,
          hasMore,
          currentPage,
          totalPages,
        },
        stats: {
          totalActivities: total,
          dateRangeDays: days,
          activityBreakdown: activityStats,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}
