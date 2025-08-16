import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Bookmark } from '@/models/bookmark';
import { Template } from '@/models/template';
import { BookmarkCollection } from '@/models/bookmarkCollection';
import { UserActivity } from '@/models/userActivities';
import {
  createBookmarkSchema,
  getBookmarksSchema,
} from '@/validation/bookmark';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reqData = await request.json();
    const validatedData = createBookmarkSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      templateId,
      collectionId,
      notes,
      tags = [],
      priority = 'medium',
      isPrivate = true,
    } = validatedData.data;

    await connectToDatabase();

    // Verify template exists
    const template = await Template.findById(templateId);
    if (!template || template.status !== 'published') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify collection exists and belongs to user (if provided)
    if (collectionId) {
      const collection = await BookmarkCollection.findOne({
        _id: collectionId,
        userId: session.user.id,
      });
      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found!' },
          { status: 404 }
        );
      }
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      userId: session.user.id,
      templateId,
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Template already bookmarked' },
        { status: 409 }
      );
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      userId: session.user.id,
      templateId,
      collectionId,
      notes,
      tags,
      isPrivate,
      metadata: {
        bookmarkedAt: new Date(),
        accessCount: 0,
        priority,
        status: isPrivate ? 'archived' : 'active',
      },
    });

    // Update collection count if bookmark is in a collection
    if (collectionId) {
      await BookmarkCollection.findByIdAndUpdate(collectionId, {
        $inc: { bookmarkCount: 1 },
      });
    }

    // Track activity
    await UserActivity.create({
      userId: session.user.id,
      templateId,
      activityType: 'bookmark',
      activityData: {
        collectionId,
        priority,
      },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
    });

    // Populate template details for response
    await bookmark.populate([
      { path: 'templateId', select: 'name description creatorId status' },
      { path: 'collectionId', select: 'name color icon' },
    ]);

    return NextResponse.json(
      {
        message: 'Template bookmarked successfully',
        bookmark,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getBookmarksSchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      collectionId,
      tags,
      priority,
      status = 'active',
      search,
      sort = 'recent',
      limit = 20,
      offset = 0,
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: any = {
      userId: session.user.id,
      'metadata.status': status,
    };

    if (collectionId) {
      conditions.collectionId = collectionId;
    }

    if (tags && tags.length > 0) {
      conditions.tags = { $in: tags };
    }

    if (priority) {
      conditions['metadata.priority'] = priority;
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'recent':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'priority':
        sortObj = { 'metadata.priority': -1, createdAt: -1 };
        break;
      case 'accessed':
        sortObj = { 'metadata.lastAccessed': -1, createdAt: -1 };
        break;
      case 'name':
        sortObj = { 'templateId.name': 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query with population
    let query = Bookmark.find(conditions)
      .populate(
        'templateId',
        'name description creatorId status copiesCount likesCount viewsCount'
      )
      .populate('collectionId', 'name color icon')
      .sort(sortObj)
      .limit(limit)
      .skip(offset);

    // Add text search if provided
    if (search) {
      query = query.where({
        $or: [
          { notes: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const bookmarks = await query.lean();
    const total = await Bookmark.countDocuments(conditions);

    // Get bookmark statistics
    const stats = await Bookmark.aggregate([
      { $match: { userId: new Types.ObjectId(session.user.id) } },
      {
        $group: {
          _id: null,
          totalBookmarks: { $sum: 1 },
          activeBookmarksCount: {
            $sum: { $cond: [{ $eq: ['$metadata.status', 'active'] }, 1, 0] },
          },
          archivedBookmarksCount: {
            $sum: { $cond: [{ $eq: ['$metadata.status', 'archived'] }, 1, 0] },
          },
          priorityBreakdown: {
            $push: '$metadata.priority',
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        bookmarks,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit),
        },
        stats: stats[0] || {
          totalBookmarks: 0,
          activeBookmarksCount: 0,
          archivedBookmarksCount: 0,
          priorityBreakdown: [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// Helper function
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  return 'unknown';
}
