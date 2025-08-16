import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Badge, IBadge } from '@/models/badge';
import { IUserStats, UserStats } from '@/models/userStats';
import { IUserBadge, UserBadge } from '@/models/userBadge';
import { getBadgesSchema } from '@/validation/badge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getBadgesSchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      category,
      rarity,
      userId,
      includeProgress = false,
      includeInactive = false,
      limit = 50,
      offset = 0,
      sort = 'rarity',
      order = 'asc',
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: {
      category?: string;
      rarityLevel?: 'common' | 'rare' | 'epic' | 'legendary';
      isActive?: boolean;
    } = {};

    if (category) {
      conditions.category = category;
    }

    if (rarity) {
      conditions.rarityLevel = rarity;
    }

    if (!includeInactive) {
      conditions.isActive = true;
    }

    // Build sort object
    const sortObj: {
      [key: string]: 1 | -1;
    } = {};
    if (sort === 'rarity') {
      sortObj.rarityLevel = order === 'desc' ? -1 : 1;
    } else if (sort === 'category') {
      sortObj.category = order === 'desc' ? -1 : 1;
    } else if (sort === 'createdAt') {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    }

    // Add secondary sort
    sortObj.pointsRequired = 1;
    sortObj.createdAt = -1;

    // Execute main query
    const badges = await Badge.find(conditions)
      .sort(sortObj)
      .limit(limit)
      .skip(offset)
      .lean();

    // Get total count for pagination
    const total = await Badge.countDocuments(conditions);

    let result = badges as IBadge[];

    // Include user progress if requested and userId provided
    if (includeProgress && userId) {
      const progressData = await getUserBadgeProgress(userId);

      result = badges.map((badge: any) => {
        const progress = progressData?.find(
          (p) => p.badge._id.toString() === badge._id.toString()
        );
        return {
          ...badge,
          userProgress: progress
            ? {
                earned: progress.earned,
                earnedAt: progress.earnedAt,
                progressPercentage: progress.progressPercentage,
                currentValue: progress.currentValue,
                targetValue: progress.targetValue,
              }
            : null,
        };
      });
    }

    // Group by category for better organization
    const groupedBadges = groupBadgesByCategory(result);

    // Get category stats
    const categoryStats = await Badge.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          rarities: { $addToSet: '$rarityLevel' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(
      {
        badges: result,
        badgesByCategory: groupedBadges,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalBadges: total,
          activeBadges: await Badge.countDocuments({ isActive: true }),
          categories: categoryStats,
          rarityDistribution: await Badge.aggregate([
            { $match: conditions },
            { $group: { _id: '$rarityLevel', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// Helper function to get user badge progress
async function getUserBadgeProgress(userId: string) {
  const userStats = (await UserStats.findOne({ userId }).lean()) as IUserStats;
  if (!userStats) return [];

  const badges = (await Badge.find({ isActive: true }).lean()) as IBadge[];
  const userBadges = (await UserBadge.find({ userId }).lean()) as IUserBadge[];
  const earnedBadges = new Map(
    userBadges.map((ub) => [ub.badgeId.toString(), ub])
  );

  return badges.map((badge) => {
    const userBadge = earnedBadges.get(badge._id.toString());

    if (userBadge) {
      return {
        badge,
        earned: true,
        earnedAt: userBadge.earnedAt,
        progressPercentage: 100,
        currentValue: badge.criteria.value,
        targetValue: badge.criteria.value,
      };
    }

    // Calculate current progress
    let currentValue = 0;
    switch (badge.criteria.type) {
      case 'templatesCreated':
        currentValue = userStats.templatesCreated || 0;
        break;
      case 'copiesReceived':
        currentValue = userStats.copiesReceived || 0;
        break;
      case 'commandsGenerated':
        currentValue = userStats.commandsGenerated || 0;
        break;
      case 'likesReceived':
        currentValue = userStats.likesReceived || 0;
        break;
      default:
        currentValue = 0;
    }

    const progressPercentage = Math.min(
      Math.round((currentValue / badge.criteria.value) * 100),
      100
    );

    return {
      badge,
      earned: false,
      progressPercentage: progressPercentage,
      currentValue: currentValue,
      targetValue: badge.criteria.value,
    };
  });
}

// Helper functions
function groupBadgesByCategory(badges: IBadge[]): Record<string, IBadge[]> {
  return badges.reduce((acc: Record<string, IBadge[]>, badge: IBadge) => {
    const category = badge.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {});
}
