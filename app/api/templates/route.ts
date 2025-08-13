import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Template } from '@/models/template';
import { Category } from '@/models/category';
import { UserStats } from '@/models/userStats';
import {
  createTemplateSchema,
  getTemplatesSchema,
} from '@/validation/template';
import { authOptions } from '@/lib/auth';

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
    const validatedData = createTemplateSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      content,
      categoryId,
      isPremium = false,
      tags = [],
      price = 0,
      status = 'draft',
    } = validatedData.data;

    await connectToDatabase();

    // Check if user already has a template with this name
    const existingTemplate = await Template.findOne({
      name,
      creatorId: session.user.id,
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'You already have a template with this name' },
        { status: 400 }
      );
    }

    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category || !category.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive category' },
          { status: 400 }
        );
      }
    }

    // Validate premium template pricing
    if (isPremium && price <= 0) {
      return NextResponse.json(
        { error: 'Premium templates must have a price greater than 0' },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate = await Template.create({
      name,
      description,
      content,
      creatorId: session.user.id,
      categoryId,
      tags,
      isPremium,
      price,
      status,
    });

    // Update user stats
    await UserStats.findOneAndUpdate(
      { userId: session.user.id },
      {
        $inc: { templatesCreated: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    // Update category template count if category provided
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { templateCount: 1 },
      });
    }

    // Populate creator and category info for response
    await newTemplate.populate([
      { path: 'creatorId', select: 'username profileImage' },
      { path: 'categoryId', select: 'name slug icon' },
    ]);

    return NextResponse.json(
      {
        message: 'Template created successfully',
        template: newTemplate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getTemplatesSchema.safeParse(queryParams);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      search,
      category,
      creator,
      status = 'published',
      isPremium,
      sort = 'popular',
      order = 'desc',
      limit = 20,
      offset = 0,
      featured = false,
    } = validatedQuery.data;

    await connectToDatabase();

    // Build query conditions
    const conditions: {
      $or?: any;
      categoryId?: string;
      creatorId?: string;
      isPremium?: boolean;
      featuredUntil?: {
        $gte: Date;
      };
      status?: string;
    } = { status };

    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      conditions.categoryId = category;
    }

    if (creator) {
      conditions.creatorId = creator;
    }

    if (isPremium !== undefined) {
      conditions.isPremium = isPremium;
    }

    if (featured) {
      conditions.featuredUntil = { $gte: new Date() };
    }

    // Build sort object
    const sortObj: {
      downloadsCount?: number;
      createdAt?: number;
      name?: number;
      likesCount?: number;
    } = {};
    switch (sort) {
      case 'popular':
        sortObj.downloadsCount = order === 'desc' ? -1 : 1;
        sortObj.likesCount = -1; // Secondary sort
        break;
      case 'recent':
        sortObj.createdAt = order === 'desc' ? -1 : 1;
        break;
      case 'name':
        sortObj.name = order === 'desc' ? -1 : 1;
        break;
      case 'downloads':
        sortObj.downloadsCount = order === 'desc' ? -1 : 1;
        break;
      default:
        sortObj.downloadsCount = -1;
    }

    // Execute query with population
    const templates = await Template.find(conditions)
      .populate('creatorId', 'username profileImage')
      .populate('categoryId', 'name slug icon')
      .sort(String(sortObj))
      .limit(limit)
      .skip(offset)
      .lean();

    // Get total count for pagination
    const total = await Template.countDocuments(conditions);

    // Get aggregated stats
    const stats = await Template.aggregate([
      { $match: conditions },
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadsCount' },
          totalLikes: { $sum: '$likesCount' },
          premiumCount: { $sum: { $cond: ['$isPremium', 1, 0] } },
        },
      },
    ]);

    return NextResponse.json(
      {
        templates,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(total / limit),
        },
        stats: stats[0] || {
          totalDownloads: 0,
          totalLikes: 0,
          premiumCount: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
