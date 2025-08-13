import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { AnalyticsDaily } from '@/models/analyticsDaily';
import { UserActivity } from '@/models/userActivity';
import { GeneratedCommand } from '@/models/generatedCommand';
import { Template } from '@/models/template';
import { User } from '@/models/user';
import { authOptions } from '@/lib/auth';
import { getDailyAnalyticsSchema } from '@/validation/analyticsDaily';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if user is admin or accessing their own data
    const user = await User.findById(session.user.id).select('isAdmin');
    const isAdmin = user?.isAdmin;

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getDailyAnalyticsSchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      startDate,
      endDate,
      templateId,
      userId,
      days = 30,
      aggregateBy = 'day',
    } = validatedQuery.data;

    // Date range calculation
    let startingDate: Date, endingDate: Date;

    if (startDate && endDate) {
      startingDate = new Date(startDate);
      endingDate = new Date(endDate);
    } else {
      endingDate = new Date();
      startingDate = new Date();
      startingDate.setDate(startingDate.getDate() - days);
    }

    // Authorization check for user-specific data
    if (userId && userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build match conditions
    const matchConditions: any = {
      date: { $gte: startingDate, $lte: endingDate },
    };

    if (templateId) {
      matchConditions.templateId = templateId;
    }

    if (userId) {
      matchConditions.userId = userId;
    }

    // If not admin and no specific filters, show only user's template analytics
    if (!isAdmin && !templateId && !userId) {
      const userTemplates = await Template.find({
        creatorId: session.user.id,
      }).select('_id');
      const templateIds = userTemplates.map((t) => t.Id);
      matchConditions.templateId = { $in: templateIds };
    }

    // Aggregation pipeline based on aggregateBy
    let groupBy: any;
    switch (aggregateBy) {
      case 'week':
        groupBy = {
          year: { $year: '$date' },
          week: { $week: '$date' },
        };
        break;
      case 'month':
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' },
        };
        break;
      default: // day
        groupBy = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
        };
    }

    // Get analytics from AnalyticsDaily table
    const analyticsData = await AnalyticsDaily.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: groupBy,
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: '$likes' },
          totalCommandsGenerated: { $sum: '$commandsGenerated' },
          uniqueUsers: { $sum: '$uniqueUsers' },
          totalRevenue: { $sum: '$revenue' },
          templateCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    ]);

    // Get real-time data if needed (for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let realtimeData = null;
    if (endingDate >= today) {
      realtimeData = await getRealTimeAnalytics(matchConditions, today);
    }

    // Get top performing templates
    const topTemplates = await AnalyticsDaily.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$templateId',
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalLikes: { $sum: '$likes' },
          score: {
            $sum: {
              $add: [
                { $multiply: ['$views', 1] },
                { $multiply: ['$likes', 3] },
                { $multiply: ['$downloads', 5] },
              ],
            },
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'templates',
          localField: '_id',
          foreignField: '_id',
          as: 'template',
        },
      },
      { $unwind: '$template' },
      {
        $project: {
          templateId: '$_id',
          templateName: '$template.name',
          creatorId: '$template.creatorId',
          totalViews: 1,
          totalDownloads: 1,
          totalLikes: 1,
          performanceScore: '$score',
          _id: 0,
        },
      },
    ]);

    // Calculate growth rates
    const growthRates = await calculateGrowthRates(matchConditions, days);

    return NextResponse.json(
      {
        analytics: analyticsData,
        realtimeData: realtimeData,
        topTemplates: topTemplates,
        growthRates: growthRates,
        dateRange: {
          start: startingDate.toISOString(),
          end: endingDate.toISOString(),
          days: Math.ceil(
            (endingDate.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
          aggregateBy,
        },
        summary: {
          totalDataPoints: analyticsData.length,
          hasRealtimeData: !!realtimeData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Helper function to get real-time analytics for today
async function getRealTimeAnalytics(baseConditions: any, today: Date) {
  const todayConditions = {
    ...baseConditions,
    created_at: { $gte: today },
  };

  const [activities, commands] = await Promise.all([
    UserActivity.aggregate([
      { $match: todayConditions },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
    ]),
    GeneratedCommand.countDocuments(todayConditions),
  ]);

  const activityBreakdown = activities.reduce((acc, activity) => {
    acc[activity.Id] = {
      count: activity.count,
      uniqueUsers: activity.uniqueUsers.length,
    };
    return acc;
  }, {});

  return {
    date: today.toISOString(),
    views: activityBreakdown.view?.count || 0,
    likes: activityBreakdown.like?.count || 0,
    downloads: activityBreakdown.download?.count || 0,
    commandsGenerated: commands,
    uniqueUsers: new Set(activities.flatMap((a) => a.uniqueUsers)).size,
    isRealtime: true,
  };
}

// Helper function to calculate growth rates
async function calculateGrowthRates(baseConditions: any, days: number) {
  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(currentPeriodStart.getDate() - days);

  const previousPeriodStart = new Date();
  previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2);
  const previousPeriodEnd = new Date(currentPeriodStart);

  const [currentPeriod, previousPeriod] = await Promise.all([
    AnalyticsDaily.aggregate([
      {
        $match: {
          ...baseConditions,
          date: { $gte: currentPeriodStart },
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: '$views' },
          downloads: { $sum: '$downloads' },
          likes: { $sum: '$likes' },
          commands: { $sum: '$commandsGenerated' },
        },
      },
    ]),
    AnalyticsDaily.aggregate([
      {
        $match: {
          ...baseConditions,
          date: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: '$views' },
          downloads: { $sum: '$downloads' },
          likes: { $sum: '$likes' },
          commands: { $sum: '$commandsGenerated' },
        },
      },
    ]),
  ]);

  const current = currentPeriod[0] || {
    views: 0,
    downloads: 0,
    likes: 0,
    commands: 0,
  };
  const previous: any = previousPeriod || {
    views: 0,
    downloads: 0,
    likes: 0,
    commands: 0,
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  };

  return {
    views: calculateGrowth(current.views, previous.views),
    downloads: calculateGrowth(current.downloads, previous.downloads),
    likes: calculateGrowth(current.likes, previous.likes),
    commandsGenerated: calculateGrowth(current.commands, previous.commands),
  };
}
