import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Badge } from '@/models/badge';
import { createBadgeSchema } from '@/validation/badge';
import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const reqData = await request.json();
    const validatedData = createBadgeSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      badgeImage,
      criteria,
      pointsRequired = 0,
      rarityLevel = 'common',
      rewardData = {},
      category = 'general',
    } = validatedData.data;

    await connectToDatabase();

    // Check if badge name already exists
    const existingBadge = await Badge.findOne({ name });
    if (existingBadge) {
      return NextResponse.json(
        { error: 'Badge with this name already exists' },
        { status: 400 }
      );
    }

    // Validate rarity vs points required consistency
    const rarityPointsMap = {
      common: { min: 0, max: 200 },
      rare: { min: 100, max: 800 },
      epic: { min: 500, max: 2000 },
      legendary: { min: 1000, max: 10000 },
    };

    const pointsRange = rarityPointsMap[rarityLevel];
    if (pointsRequired < pointsRange.min || pointsRequired > pointsRange.max) {
      return NextResponse.json(
        {
          error: `Points required for ${rarityLevel} badge should be between ${pointsRange.min} and ${pointsRange.max}`,
        },
        { status: 400 }
      );
    }

    // Create new badge
    const newBadge = await Badge.create({
      name,
      description,
      badgeImage,
      criteria,
      pointsRequired,
      rarityLevel,
      rewardData,
      category,
    });

    return NextResponse.json(
      {
        message: 'Badge created successfully',
        badge: newBadge,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
