import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { Template } from '@/models/template';
import { UserActivity } from '@/models/userActivities';
import { authOptions } from '@/lib/auth';
import { updateTemplateSchema } from '@/validation/template';
import { UserStats } from '@/models/userStats';
import { Category } from '@/models/category';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const template: any = await Template.findById(id)
      .populate('creatorId', 'username profileImage')
      .populate('categoryId', 'name slug icon')
      .lean();

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if user can access this template
    if (
      template.status === 'draft' &&
      (!session || session.user.id !== template.creatorId.Id.toString())
    ) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Track view activity (if not the creator viewing their own template)
    if (session && session.user.id !== template.creatorId._id.toString()) {
      // Increment view count
      await Template.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

      // Record user activity
      await UserActivity.create({
        userId: session.user.id,
        templateId: id,
        activityType: 'view',
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
      });
    } else if (!session) {
      // Anonymous view - just increment count
      await Template.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    }

    // Get related templates from same creator or category
    const relatedTemplates = await Template.find({
      $and: [
        { _id: { $ne: id } },
        { status: 'published' },
        {
          $or: [
            { creatorId: template.creatorId._id },
            { categoryId: template.categoryId?._id },
          ],
        },
      ],
    })
      .populate('creatorId', 'username profileImage')
      .sort({ downloadsCount: -1 })
      .limit(4)
      .lean();

    return NextResponse.json(
      {
        template: {
          ...template,
          viewsCount: template.viewsCount + 1, // Return updated count
        },
        relatedTemplates: relatedTemplates,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  return 'unknown';
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const reqData = await request.json();
    const validatedData = updateTemplateSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (template.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own templates' },
        { status: 403 }
      );
    }

    const updateData = validatedData.data;

    // Validate category if being updated
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category || !category.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive category' },
          { status: 400 }
        );
      }
    }

    // Handle category change - update counts
    if (
      updateData.categoryId &&
      updateData.categoryId !== template.categoryId?.toString()
    ) {
      // Decrement old category
      if (template.categoryId) {
        await Category.findByIdAndUpdate(template.categoryId, {
          $inc: { templateCount: -1 },
        });
      }

      // Increment new category
      await Category.findByIdAndUpdate(updateData.categoryId, {
        $inc: { templateCount: 1 },
      });
    }

    // Validate premium pricing
    if (
      updateData.isPremium &&
      updateData.price !== undefined &&
      updateData.price <= 0
    ) {
      return NextResponse.json(
        { error: 'Premium templates must have a price greater than 0' },
        { status: 400 }
      );
    }

    // Update template
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'creatorId', select: 'username profileImage' },
      { path: 'categoryId', select: 'name slug icon' },
    ]);

    return NextResponse.json(
      {
        message: 'Template updated successfully',
        template: updatedTemplate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const template = await Template.findById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin privileges
    const isOwner = template.creatorId.toString() === session.user.id;
    const isAdmin = await checkUserIsAdmin(session.user.id);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own templates' },
        { status: 403 }
      );
    }

    // Check if template has significant usage (downloads/likes)
    const hasSignificantUsage =
      template.downloadsCount > 10 || template.likesCount > 5;

    if (hasSignificantUsage && !isAdmin) {
      // Archive instead of delete for templates with usage
      await Template.findByIdAndUpdate(id, {
        status: 'archived',
        lastUpdated: new Date(),
      });

      return NextResponse.json(
        {
          message:
            'Template archived due to existing usage. Contact support for permanent deletion.',
        },
        { status: 200 }
      );
    }

    // Safe to delete - remove from database
    await Template.findByIdAndDelete(id);

    // Update category count
    if (template.categoryId) {
      await Category.findByIdAndUpdate(template.categoryId, {
        $inc: { templateCount: -1 },
      });
    }

    // Update user stats
    await UserStats.findOneAndUpdate(
      { userId: template.creatorId },
      {
        $inc: { templatesCreated: -1 },
        $set: { updatedAt: new Date() },
      }
    );

    // Clean up related data
    await Promise.all([
      UserActivity.deleteMany({ templateId: id }),
      // Add other cleanup as needed
    ]);

    return NextResponse.json(
      {
        message: 'Template deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
