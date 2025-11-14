import { authOptions } from '@/lib/auth';
import { IUser, User } from '@/models/user';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Badge, IBadge } from '@/models/badge';
import { UserBadge } from '@/models/userBadge';
import { UserStats } from '@/models/userStats';
import { awardBadgeSchema } from '@/validation/badge';
import { NextRequest, NextResponse } from 'next/server';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';
import {
  checkAndAwardBadges,
  awardBadgeToUser,
  evaluateBadgeCriteria,
} from '@/services/badge';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );

    const body = await request.json();

    const validatedData = awardBadgeSchema.safeParse(body);
    if (!validatedData.success)
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );

    const {
      userId,
      badgeId,
      reason,
      overrideCriteria = false,
    } = validatedData.data;

    const [user, badge] = (await Promise.all([
      User.findById(userId).lean(),
      Badge.findById(badgeId).lean(),
    ])) as [IUser, IBadge];

    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!badge?.isActive)
      return NextResponse.json({ error: 'Badge inactive' }, { status: 404 });

    const alreadyHas = await UserBadge.findOne({ userId, badgeId });
    if (alreadyHas)
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      );

    if (!overrideCriteria) {
      const stats = await UserStats.findOne({ userId }).lean();
      if (!stats || !evaluateBadgeCriteria(badge, stats))
        return NextResponse.json(
          { error: 'Criteria not met' },
          { status: 400 }
        );
    }

    const result = await awardBadgeToUser(userId, badge);

    return NextResponse.json(
      {
        success: true,
        message: 'Badge awarded successfully',
        data: {
          ...result,
          awardedBy: session.user.id,
          reason,
          overrideCriteria,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('POST /api/badges error:', err);
    return NextResponse.json(
      {
        error: 'Failed to award badge',
        details: error,
      },
      { status: 500 }
    );
  }
}

// Check and award eligible badges
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await request.json();
    const targetUserId = userId || session.user.id;

    await connectToDatabase();

    if (targetUserId !== session.user.id) {
      const isAdmin = await checkUserIsAdmin(session.user.id);
      if (!isAdmin)
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const awarded = await checkAndAwardBadges(targetUserId);

    return NextResponse.json({
      success: true,
      message: `Badge check complete. ${awarded.length} new badges awarded.`,
      data: { awarded },
    });
  } catch (error) {
    // console.error('PATCH /api/badges error:', err);
    return NextResponse.json(
      {
        error: 'Failed to check badges',
        details: error,
      },
      { status: 500 }
    );
  }
}
