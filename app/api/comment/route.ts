import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Comment } from "@/models/comment";
import { getCommentsSchema, createCommentSchema } from "@/validation/comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


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

        const validatedQuery = getCommentsSchema.safeParse(queryParams);

        if (!validatedQuery.success) {
            return NextResponse.json(
                { error: validatedQuery.error.issues[0].message },
                { status: 400 }
            );
        }

        const {
            templateId,
            limit = 20,
            offset = 0
        } = validatedQuery.data;

        await connectToDatabase();

        const comments = await Comment.find(
            { templateId },
            { skip: offset, limit: limit }
        );

        return NextResponse.json({
            message: 'Comments fetched successfully',
            comments
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

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
        const validated = createCommentSchema.safeParse(reqData);

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const { commentText, templateId } = validated.data;

        const newComment = await Comment.create({
            commentText,
            templateId,
            userId: session.user.id,
        });

        return NextResponse.json({ message: 'Comment created successfully', comment: newComment }, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}