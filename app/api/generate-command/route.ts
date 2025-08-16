import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { ProjectOption } from '@/models/projectOption';
import { PackageManager } from '@/models/packageManager';
import { GeneratedCommand } from '@/models/generatedCommand';
import { UserStats } from '@/models/userStats';
import { authOptions } from '@/lib/auth';
import { generateCommandSchema } from '@/validation/generateCommand';
import { CommandGeneratorService } from '@/services/commandGeneratorService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request
    let reqData;
    try {
      reqData = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = generateCommandSchema.safeParse(reqData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      projectName,
      projectCategory,
      packageManagerId,
      selectedOptionIds,
      customOptions,
    } = validation.data;

    await connectToDatabase();

    // Fetch package manager and selected options in parallel
    const [packageManager, selectedOptions]: any = await Promise.all([
      PackageManager.findById(packageManagerId).lean(),
      ProjectOption.find({
        _id: { $in: selectedOptionIds },
        isActive: true,
      })
        .sort({ sortOrder: 1 })
        .lean(),
    ]);

    // Validation
    if (!packageManager?.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive package manager' },
        { status: 400 }
      );
    }

    if (
      selectedOptionIds.length > 0 &&
      selectedOptions.length !== selectedOptionIds.length
    ) {
      return NextResponse.json(
        { error: 'Some selected options are invalid or inactive' },
        { status: 400 }
      );
    }

    // Generate command text
    const commandText = CommandGeneratorService.generateCommandText(
      projectName,
      projectCategory,
      packageManager,
      selectedOptions,
      customOptions
    );

    // Generate project structure
    const projectStructure = CommandGeneratorService.generateProjectStructure(
      projectName,
      selectedOptions
    );

    const generationTime = Date.now() - startTime;

    // Save generated command
    const generatedCommand = await GeneratedCommand.create({
      userId: session.user.id,
      packageManagerId,
      projectName,
      projectCategory,
      selectedOptions: selectedOptionIds,
      customOptions,
      commandText,
      generationTime,
      ipAddress: getClientIP(request),
    });

    // Update stats in parallel (non-blocking)
    Promise.all([
      UserStats.findOneAndUpdate(
        { userId: session.user.id },
        {
          $inc: { commandsGenerated: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      ),
      PackageManager.findByIdAndUpdate(packageManagerId, {
        $inc: { usageCount: 1 },
      }),
    ]).catch((error) => console.error('Stats update failed:', error));

    return NextResponse.json(
      {
        success: true,
        message: 'Command generated successfully',
        data: {
          generationId: generatedCommand._id,
          commandText,
          projectStructure,
          metadata: {
            projectName,
            projectCategory,
            packageManager: {
              name: packageManager.name,
              displayName: packageManager.displayName,
            },
            optionsUsed: selectedOptions.length,
            customOptionsUsed: customOptions.length,
            generationTime,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Command generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate command' },
      { status: 500 }
    );
  }
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP.trim();
  return 'unknown';
}
