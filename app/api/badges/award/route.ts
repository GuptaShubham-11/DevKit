import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Badge } from '@/models/badge';
import { UserBadge } from '@/models/userBadge';
import { UserStats } from '@/models/userStats';
import { Notification } from '@/models/notification';
import { IUser, User } from '@/models/user';
import { authOptions } from '@/lib/auth';
import { awardBadgeSchema } from '@/validation/badge';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = (await User.findById(session.user.id)
      .select('isAdmin')
      .lean()) as IUser;
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = awardBadgeSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      userId,
      badgeId,
      reason,
      overrideCriteria = false,
    } = validatedData.data;

    await connectToDatabase();

    // Validate user and badge exist
    const [targetUser, badge]: any = await Promise.all([
      User.findById(userId).lean(),
      Badge.findById(badgeId).lean(),
    ]);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!badge || !badge.isActive) {
      return NextResponse.json(
        { error: 'Badge not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user already has this badge
    const existingUserBadge = await UserBadge.findOne({ userId, badgeId });
    if (existingUserBadge) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      );
    }

    // Check criteria unless override is enabled
    if (!overrideCriteria) {
      const userStats = await UserStats.findOne({ userId }).lean();
      if (
        !userStats ||
        !BadgeEvaluationService.evaluateBadgeCriteria(badge, userStats)
      ) {
        return NextResponse.json(
          { error: 'User does not meet badge criteria' },
          { status: 400 }
        );
      }
    }

    // Award the badge
    const result = await BadgeEvaluationService.awardBadgeToUser(userId, badge);

    // // Log admin action
    // console.log(`Admin ${session.user.id} awarded badge ${badgeId} to user ${userId}. Reason: ${reason}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Badge awarded successfully',
        data: {
          userBadge: result.userBadge,
          badge: result.badge,
          awardedBy: session.user.id,
          reason,
          overrideCriteria,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error awarding badge:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();
    const targetUserId = userId || session.user.id;

    // Users can only check their own badges unless admin
    if (targetUserId !== session.user.id) {
      const user = (await User.findById(session.user.id)
        .select('isAdmin')
        .lean()) as IUser;
      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    await connectToDatabase();

    // Check and award any qualifying badges
    const awardedBadges =
      await BadgeEvaluationService.checkAndAwardBadges(targetUserId);

    return NextResponse.json({
      success: true,
      message: `Badge check completed. ${awardedBadges.length} new badges awarded.`,
      data: {
        awardedBadges,
        count: awardedBadges.length,
      },
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}

class BadgeEvaluationService {
  static async checkAndAwardBadges(userId: string): Promise<any[]> {
    const awardedBadges = [];

    try {
      const [userStats, activeBadges, userBadges]: any = await Promise.all([
        UserStats.findOne({ userId }).lean(),
        Badge.find({ isActive: true }).lean(),
        UserBadge.find({ userId }).lean(),
      ]);

      if (!userStats) return [];

      const earnedBadgeIds = new Set(
        userBadges.map((ub: any) => ub.badgeId.toString())
      );

      for (const badge of activeBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge._id.toString())) continue;

        // Check if user meets criteria
        const meetsRequirements = this.evaluateBadgeCriteria(badge, userStats);

        if (meetsRequirements) {
          const awardedBadge = await this.awardBadgeToUser(userId, badge);
          awardedBadges.push(awardedBadge);
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Badge evaluation error:', error);
      return [];
    }
  }

  static evaluateBadgeCriteria(badge: any, userStats: any): boolean {
    const { type, condition, value } = badge.criteria;

    let currentValue = 0;
    switch (type) {
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
      case 'totalViews':
        currentValue = userStats.totalViews || 0;
        break;
      default:
        return false;
    }

    // Evaluate condition
    switch (condition) {
      case 'gte':
        return currentValue >= value;
      case 'lte':
        return currentValue <= value;
      case 'eq':
        return currentValue === value;
      case 'between':
        // Assume value is [min, max] for between condition
        if (Array.isArray(value) && value.length === 2) {
          return currentValue >= value[0] && currentValue <= value[1];
        }
        return false;
      default:
        return false;
    }
  }

  static async awardBadgeToUser(userId: string, badge: any): Promise<any> {
    try {
      // Create UserBadge record
      const userBadge = await UserBadge.create({
        userId,
        badgeId: badge._id,
        earnedAt: new Date(),
        progressData: {
          criteriaType: badge.criteria.type,
          valueAchieved: true,
          earnedAutomatically: true,
        },
        notificationSent: true,
        isFeatured: badge.rarityLevel === 'legendary',
      });

      // Send notification
      await this.sendBadgeNotification(userId, badge);

      // Update user experience points
      if (badge.rewardData?.xpBonus) {
        await UserStats.findOneAndUpdate(
          { userId },
          {
            $inc: { experience: badge.rewardData.xpBonus },
            $set: { updatedAt: new Date() },
          }
        );
      }

      return {
        userBadge,
        badge,
        notification: true,
      };
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  static async sendBadgeNotification(
    userId: string,
    badge: any
  ): Promise<void> {
    try {
      const rarityEmojis: any = {
        common: '🥉',
        rare: '🥈',
        epic: '🥇',
        legendary: '👑',
      };

      const emoji = rarityEmojis[badge.rarityLevel] || '🏅';

      await Notification.create({
        userId,
        type: 'badge_earned',
        title: `${emoji} New Badge Earned!`,
        message: `Congratulations! You've earned the "${badge.name}" badge. ${badge.description}`,
        data: {
          badgeId: badge._id,
          badgeName: badge.name,
          badgeImage: badge.badgeImage,
          rarityLevel: badge.rarityLevel,
          category: badge.category,
          xpBonus: badge.rewardData?.xpBonus || 0,
          earnedAt: new Date(),
        },
        actionUrl: `/profile?tab=badges&highlight=${badge._id}`,
        isRead: false,
      });
    } catch (error) {
      console.error('Error sending badge notification:', error);
    }
  }
}
