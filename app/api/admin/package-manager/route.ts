import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { PackageManager } from '@/models/packageManager';
import { createPackageManagerSchema } from '@/validation/packageManager';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session) {
    //     return NextResponse.json(
    //         { error: 'Authentication required' },
    //         { status: 401 }
    //     );
    // }

    // const isAdmin = await checkUserIsAdmin(session.user.id);
    // if (!isAdmin) {
    //     return NextResponse.json(
    //         { error: 'Admin access required' },
    //         { status: 403 }
    //     );
    // }

    const reqData = await request.json();
    const validatedData = createPackageManagerSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      displayName,
      description,
      installCmd,
      addPackageCmd,
      devCmd,
      buildCmd,
      icon,
      documentationUrl,
      homepageUrl,
      supportedPlatforms = ['all'],
      features = [],
      metadata = {},
    } = validatedData.data;

    await connectToDatabase();

    // Check if package manager already exists
    const existingPM = await PackageManager.findOne({ name });
    if (existingPM) {
      return NextResponse.json(
        { error: 'Package manager with this name already exists' },
        { status: 400 }
      );
    }

    // Create new package manager
    const newPackageManager = await PackageManager.create({
      name,
      displayName,
      description,
      installCmd,
      addPackageCmd,
      devCmd,
      buildCmd,
      icon,
      documentationUrl,
      homepageUrl,
      supportedPlatforms,
      features,
      metadata,
    });

    return NextResponse.json(
      {
        message: 'Package manager created successfully',
        packageManager: newPackageManager,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating package manager:', error);
    return NextResponse.json(
      { error: 'Failed to create package manager' },
      { status: 500 }
    );
  }
}
