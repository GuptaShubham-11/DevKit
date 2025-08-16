import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ProjectOption } from '@/models/projectOption';
import { createProjectOptionSchema } from '@/validation/projectOption';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const reqData = await req.json();
    const validatedData = createProjectOptionSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const projectOption = await ProjectOption.create(validatedData.data);

    return NextResponse.json(
      { message: 'Project option created successfully', data: projectOption },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project option:', error);
    return NextResponse.json(
      { error: 'Error creating project option' },
      { status: 500 }
    );
  }
}
