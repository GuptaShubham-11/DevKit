import { authOptions } from '@/lib/auth';
import { checkUserIsAdmin } from '@/lib/checkUserIsAdmin';
import { connectToDatabase } from '@/lib/db';
import { ProjectOption } from '@/models/projectOption';
import { updateProjectOptionSchema } from '@/validation/projectOption';
import { isValidObjectId } from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Project option ID is required' },
        { status: 400 }
      );
    }

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

    const reqData = await request.json();
    const validatedData = updateProjectOptionSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const projectOption = await ProjectOption.findByIdAndUpdate(
      id,
      validatedData.data,
      { new: true }
    );

    return NextResponse.json(
      { message: 'Project option updated successfully', data: projectOption },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating project option:', error);
    return NextResponse.json(
      { error: 'Error updating project option' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Project option ID is required' },
        { status: 400 }
      );
    }

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
    await ProjectOption.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Project option deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project option:', error);
    return NextResponse.json(
      { error: 'Error deleting project option' },
      { status: 500 }
    );
  }
}
