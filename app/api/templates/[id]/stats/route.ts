import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { ITemplate, Template } from '@/models/template';
import { UserActivity } from '@/models/userActivities';
import { GeneratedCommand } from '@/models/generatedCommand';
import { Notification } from '@/models/notification';
import { IUser, User } from '@/models/user';
import { authOptions } from '@/lib/auth';

interface Props {
  params: { id: string };
}

// Helper to parse boolean query flag
function parseFlag(val: string | null): boolean {
  return val === 'true' || val === '1';
}

// Notification service class
class NotificationService {
  private static readonly MILESTONES = [
    10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000, 35000, 50000,
    75000, 100000,
  ];

  private static readonly NOTIFICATION_CONFIG: any = {
    like: {
      type: 'template_liked',
      title: '👍 Someone liked your template',
      shouldSend: true,
    },
    copy: {
      type: 'template_copied',
      title: '📋 Someone copied your template',
      shouldSend: true,
    },
    view: {
      type: 'template_milestone',
      title: '🎉 Template milestone reached!',
      shouldSend: false,
    },
  };

  static async sendActivityNotification(
    template: any,
    actorUser: any,
    activityType: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      // Don't notify if user is interacting with their own template
      if (template.creatorId.toString() === actorUser._id.toString()) {
        return;
      }

      const config = this.NOTIFICATION_CONFIG[activityType];
      if (!config) return;

      let message = '';
      let shouldSend = config.shouldSend;

      // Generate appropriate message
      switch (activityType) {
        case 'like':
          const newLikeCount = template.likesCount + 1;
          if (this.MILESTONES.includes(newLikeCount)) {
            message = `Your template "${template.name}" has reached ${newLikeCount} likes! 👍`;
            shouldSend = true;
          } else {
            message = `${actorUser.username} liked your template "${template.name}"`;
          }
          break;

        case 'copy':
          const newCopyCount = template.copiesCount + 1;
          if (this.MILESTONES.includes(newCopyCount)) {
            message = `Your template "${template.name}" has reached ${newCopyCount} copies! 📋`;
            shouldSend = true;
          } else {
            message = `${actorUser.username} copied your template "${template.name}"`;
          }
          break;

        case 'view':
          const newViewCount = template.viewsCount + 1;
          if (this.MILESTONES.includes(newViewCount)) {
            message = `Your template "${template.name}" has reached ${newViewCount} views! 🚀`;
            shouldSend = true;
          }
          break;
      }

      if (shouldSend && message) {
        await Notification.create({
          userId: template.creatorId,
          type: config.type,
          title: config.title,
          message,
          data: {
            templateId: template._id,
            templateName: template.name,
            actorId: actorUser._id,
            actorUsername: actorUser.username,
            activityType,
            ...metadata,
          },
          actionUrl: `/templates/${template._id}`,
          isRead: false,
        });
      }
    } catch (error) {
      console.error('Notification sending failed:', error);
    }
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const days = Math.min(
      parseInt(request.nextUrl.searchParams.get('days') || '30'),
      365
    );
    const includeDetailed = parseFlag(
      request.nextUrl.searchParams.get('includeDetailed')
    );

    await connectToDatabase();

    const template = (await Template.findById(id).lean()) as ITemplate;
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const templateObjectId = new mongoose.Types.ObjectId(id);

    // Parallel execution of basic queries
    const [activityStats, commandStats] = await Promise.all([
      // Activity stats
      UserActivity.aggregate([
        {
          $match: {
            templateId: templateObjectId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            users: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            activityType: '$_id',
            count: 1,
            uniqueUsers: { $size: '$users' },
            _id: 0,
          },
        },
      ]),

      // Command stats
      GeneratedCommand.aggregate([
        {
          $match: {
            templateId: templateObjectId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$packageManagerId',
            count: { $sum: 1 },
            avgTime: { $avg: '$generationTime' },
          },
        },
        {
          $lookup: {
            from: 'packagemanagers',
            localField: '_id',
            foreignField: '_id',
            as: 'pm',
          },
        },
        { $unwind: '$pm' },
        {
          $project: {
            packageManager: '$pm.name',
            count: 1,
            avgGenerationTime: { $round: ['$avgTime', 2] },
            _id: 0,
          },
        },
      ]),
    ]);

    const result: any = {
      basicStats: {
        templateId: id,
        name: template.name,
        creatorId: template.creatorId,
        totalViews: template.viewsCount,
        totalLikes: template.likesCount,
        totalCopies: template.copiesCount,
        status: template.status,
      },
      activityStats,
      commandStats,
      dateRange: { days, start: startDate, end: new Date() },
    };

    // Include detailed stats if requested
    if (includeDetailed) {
      const [dailyActivity, topReferrers] = await Promise.all([
        // Daily activity breakdown
        UserActivity.aggregate([
          {
            $match: {
              templateId: templateObjectId,
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                date: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                type: '$activityType',
              },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: '$_id.date',
              activities: { $push: { type: '$_id.type', count: '$count' } },
              total: { $sum: '$count' },
            },
          },
          { $sort: { _id: -1 } },
        ]),

        // Top referrers
        UserActivity.aggregate([
          {
            $match: {
              templateId: templateObjectId,
              createdAt: { $gte: startDate },
              referrer: { $exists: true, $ne: null },
            },
          },
          { $group: { _id: '$referrer', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { referrer: '$_id', count: 1, _id: 0 } },
        ]),
      ]);

      result.dailyActivity = dailyActivity;
      result.topReferrers = topReferrers;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET template stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template statistics' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    // Validation
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
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

    // Parse request body
    let reqData;
    try {
      reqData = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { activityType, activityData = {} } = reqData;

    // Validate activity type
    const validActivityTypes = [
      'like',
      'view',
      'comment',
      'share',
      'bookmark',
      'copy',
    ];
    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch template and user data in parallel
    const [template, actorUser] = await Promise.all([
      Template.findById(id).lean(),
      User.findById(session.user.id).select('username profileImage').lean(),
    ]);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Prevent duplicate activities for certain types
    if (['like', 'bookmark'].includes(activityType)) {
      const existing = await UserActivity.findOne({
        userId: session.user.id,
        templateId: id,
        activityType,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existing) {
        return NextResponse.json(
          { error: `Already ${activityType}d this template recently` },
          { status: 409 }
        );
      }
    }

    // Extract client information safely
    const clientInfo = {
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown',
      userAgent: request.headers.get('user-agent')?.substring(0, 500),
      referrer: request.headers.get('referer')?.substring(0, 500),
      sessionId: request.headers.get('x-session-id')?.substring(0, 100),
    };

    // Create activity record and update counters in parallel
    const counterUpdates: Record<string, number> = {};

    switch (activityType) {
      case 'view':
        counterUpdates.viewsCount = 1;
        break;
      case 'like':
        counterUpdates.likesCount = 1;
        break;
      case 'copy':
        counterUpdates.copiesCount = 1;
        break;
    }

    const [activityRecord] = await Promise.all([
      // Create activity record
      UserActivity.create({
        userId: session.user.id,
        templateId: id,
        activityType,
        activityData: {
          ...activityData,
          timestamp: new Date(),
          ...clientInfo,
        },
        ...clientInfo,
      }),

      // Update template counters if needed
      Object.keys(counterUpdates).length > 0
        ? Template.findByIdAndUpdate(id, {
            $inc: counterUpdates,
            lastUpdated: new Date(),
          }).exec()
        : Promise.resolve(),
    ]);

    // Send notification asynchronously (don't wait for it)
    NotificationService.sendActivityNotification(
      template,
      actorUser,
      activityType,
      { activityId: activityRecord._id }
    ).catch((error) => console.error('Notification failed:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Activity tracked successfully',
        data: {
          activityId: activityRecord._id,
          activityType,
          templateId: id,
          timestamp: activityRecord.createdAt,
          counters: counterUpdates,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('PUT activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}
