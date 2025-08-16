import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ProjectOption } from '@/models/projectOption';
import { getProjectOptionsSchema } from '@/validation/projectOption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getProjectOptionsSchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: validatedQuery.error.issues[0].message },
        { status: 400 }
      );
    }

    const { category, packageManager } = validatedQuery.data;

    await connectToDatabase();

    // Get filtered options
    const options = await ProjectOption.find({
      $and: [{ category }, { packageManager }],
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(
      {
        message: 'Project options fetched successfully',
        options,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching project options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project options' },
      { status: 500 }
    );
  }
}
