import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { BookmarkCollection } from '@/models/bookmarkCollection';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

interface Params {
    params: {
        id: string;
    };
}

export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { error: 'Invalid collection ID' },
                { status: 400 }
            );
        }

        const deletedCollection = await BookmarkCollection.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        return NextResponse.json(
            { message: 'Collection deleted successfully', data: deletedCollection },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting collection:', error);
        return NextResponse.json(
            { error: 'Failed to delete collection' },
            { status: 500 }
        );
    }
}