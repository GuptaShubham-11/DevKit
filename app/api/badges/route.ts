import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Badge, IBadge } from '@/models/badge';
import { UserStats } from '@/models/userStats';
import { UserBadge } from '@/models/userBadge';
import { getBadgesSchema } from '@/validation/badge';
import { NextRequest, NextResponse } from 'next/server';

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
    const conditions: any = {};
    if (category) conditions.category = category;
    if (rarity) conditions.rarityLevel = rarity;
    if (!includeInactive) conditions.isActive = true;

    // Build sort object
    const sortObj: any = {};
    switch (sort) {
      case 'rarity':
        sortObj.rarityLevel = order === 'desc' ? -1 : 1;
        break;
      case 'category':
        sortObj.category = order === 'desc' ? -1 : 1;
        break;
      case 'createdAt':
        sortObj.createdAt = order === 'desc' ? -1 : 1;
        break;
      case 'name':
        sortObj.name = order === 'desc' ? -1 : 1;
        break;
      default:
        sortObj.pointsRequired = 1;
    }
    sortObj.createdAt = -1; // Secondary sort

    // Execute main query
    const [badges, total] = await Promise.all([
      Badge.find(conditions).sort(sortObj).limit(limit).skip(offset).lean(),
      Badge.countDocuments(conditions),
    ]);

    let result = badges as IBadge[];

    // Include user progress if requested and userId provided
    if (includeProgress && userId) {
      const progressData = await getUserBadgeProgress(userId);

      result = badges.map((badge: any) => {
        const progress = progressData?.find(
          (p: any) => p.badge._id.toString() === badge._id.toString()
        );
        return {
          ...badge,
          userProgress: progress || {
            earned: false,
            earnedAt: null,
            progressPercentage: 0,
            currentValue: 0,
            targetValue: badge.criteria.value,
          },
        };
      });
    }

    // Get stats in parallel
    const [categoryStats, rarityDistribution] = await Promise.all([
      Badge.aggregate([
        { $match: conditions },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            rarities: { $addToSet: '$rarityLevel' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Badge.aggregate([
        { $match: conditions },
        { $group: { _id: '$rarityLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        badges: result,
        badgesByCategory: groupBadgesByCategory(result),
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
          rarityDistribution,
        },
      },
    });
  } catch (error) {
    // console.error('Error fetching badges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch badges',
        details: error,
      },
      { status: 500 }
    );
  }
}

// Helper function to get user badge progress
async function getUserBadgeProgress(userId: string) {
  if (!mongoose.isValidObjectId(userId)) return [];

  try {
    const [userStats, badges, userBadges]: any = await Promise.all([
      UserStats.findOne({ userId }).lean(),
      Badge.find({ isActive: true }).lean(),
      UserBadge.find({ userId }).lean(),
    ]);

    if (!userStats) return [];

    const earnedBadges = new Map(
      userBadges.map((ub: any) => [ub.badgeId.toString(), ub])
    );

    return badges.map((badge: any) => {
      const userBadge = earnedBadges.get(badge._id.toString()) as any;

      if (userBadge) {
        return {
          badge,
          earned: true,
          earnedAt: userBadge?.earnedAt,
          progressPercentage: 100,
          currentValue: badge.criteria.value,
          targetValue: badge.criteria.value,
        };
      }

      // Calculate current progress based on criteria type
      let currentValue = 0;
      switch (badge.criteria.type) {
        case 'templatesCreated':
          currentValue = userStats.templatesCreated || 0;
          break;
        case 'downloadsReceived':
          currentValue = userStats.downloadsReceived || 0;
          break;
        case 'commandsGenerated':
          currentValue = userStats.commandsGenerated || 0;
          break;
        case 'likesReceived':
          currentValue = userStats.likesReceived || 0;
          break;
        case 'totalViews':
          currentValue = userStats.totalViews || 0;
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
        progressPercentage,
        currentValue,
        targetValue: badge.criteria.value,
      };
    });
  } catch {
    // console.error('Error calculating badge progress:', error);
    return [];
  }
}

// Helper function to group badges by category
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
