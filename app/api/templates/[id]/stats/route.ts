import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Template } from '@/models/template';
import { UserActivity } from '@/models/userActivities';
import { GeneratedCommand } from '@/models/generatedCommand';
import { UserActivityService } from '@/services/userActivity';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 365);
    const includeDetailed = searchParams.get('includeDetailed') === 'true';

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const template: any = await Template.findById(id).lean();

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic template stats
    const basicStats = {
      templateId: id,
      templateName: template.name,
      creatorId: template.creatorId,
      totalViews: template.viewsCount,
      totalLikes: template.likesCount,
      totalDownloads: template.downloadsCount,
      status: template.status,
    };

    // Activity stats for date range
    const activityStats = await UserActivity.aggregate([
      {
        $match: {
          templateId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          activityType: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          _id: 0,
        },
      },
    ]);

    // Command generation stats
    const commandStats = await GeneratedCommand.aggregate([
      {
        $match: {
          templateId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$packageManagerId',
          count: { $sum: 1 },
          avgGenerationTime: { $avg: '$generationTime' },
        },
      },
      {
        $lookup: {
          from: 'packagemanagers',
          localField: '_id',
          foreignField: '_id',
          as: 'packageManager',
        },
      },
      {
        $unwind: '$packageManager',
      },
      {
        $project: {
          packageManagerName: '$packageManager.name',
          displayName: '$packageManager.displayName',
          commandCount: '$count',
          avgGenerationTime: { $round: ['$avgGenerationTime', 2] },
          _id: 0,
        },
      },
      { $sort: { commandCount: -1 } },
    ]);

    let detailedStats = {};

    if (includeDetailed) {
      // Daily activity breakdown
      const dailyActivity = await UserActivity.aggregate([
        {
          $match: {
            templateId: new mongoose.Types.ObjectId(id),
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                },
              },
              activityType: '$activityType',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            activities: {
              $push: {
                type: '$_id.activityType',
                count: '$count',
              },
            },
            total: { $sum: '$count' },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      // Top referrers
      const topReferrers = await UserActivity.aggregate([
        {
          $match: {
            templateId: new mongoose.Types.ObjectId(id),
            createdAt: { $gte: startDate },
            referrer: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$referrer',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      detailedStats = {
        dailyActivity: dailyActivity,
        topReferrers: topReferrers,
      };
    }

    return NextResponse.json(
      {
        basicBtats: basicStats,
        activityBtats: activityStats,
        commandBtats: commandStats,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days,
        },
        ...detailedStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching template stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reqData = await request.json();
    const { activityType, activityData = {} } = reqData;

    if (
      !['like', 'view', 'comment', 'share', 'bookmark'].includes(activityType)
    ) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    // Track the activity using UserActivityService
    const result = await UserActivityService.trackActivity(id, activityType, {
      userId: session.user.id,
      request,
      additionalData: activityData,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: 'Activity tracked successfully',
        activity: result.activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error tracking template activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}
