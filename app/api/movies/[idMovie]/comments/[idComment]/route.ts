import {NextResponse} from 'next/server';
import {Db, MongoClient} from 'mongodb';
import {ObjectId} from 'bson';
import {COMMENTS, DB_NAME} from "@/app/constants/constants";
import clientPromise from '@/lib/mongodb';
import {commentSchema} from "@/app/schemas/commentSchema";
import {CommentsRoadContext} from "@/app/interface/commentInterface";

export async function GET(_request: Request, {params}: CommentsRoadContext): Promise<NextResponse> {
    const {idMovie, idComment} = await params;

    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
        return NextResponse.json({status: 400, message: 'Invalid movie ID or comment ID'});
    }

    try {
        const client: MongoClient = await clientPromise;
        const db = client.db(DB_NAME);
        const comment = await db.collection(COMMENTS)
            .findOne({
                _id: ObjectId.createFromHexString(idComment),
                movie_id: ObjectId.createFromHexString(idMovie),
            });

        if (!comment) {
            return NextResponse.json({status: 404, message: 'Comment not found for this movie'});
        }

        return NextResponse.json({status: 200, data: comment});
    } catch (error: any) {
        console.error('Error fetching comment:', error);

        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export async function PUT(request: Request, {params}: CommentsRoadContext): Promise<NextResponse> {
    const {idMovie, idComment} = await params;

    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
        return NextResponse.json({
            status: 400,
            message: 'Invalid movie ID or comment ID',
        });
    }

    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const commentExists = await db.collection(COMMENTS)
            .findOne({
                _id: ObjectId.createFromHexString(idComment),
                movie_id: ObjectId.createFromHexString(idMovie),
            });

        if (!commentExists) {
            return NextResponse.json({
                status: 404,
                message: 'Comment not found for this movie',
            });
        }

        const body = await request.json();
        const validData = commentSchema
            .pick({name: true, email: true, text: true})
            .parse(body);

        await db.collection(COMMENTS).updateOne(
            {_id: ObjectId.createFromHexString(idComment)},
            {$set: validData}
        );

        return NextResponse.json({
            status: 200,
            message: 'Comment updated successfully',
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({
                status: 400,
                message: 'Validation error',
                errors: error.errors,
            });
        }

        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function DELETE(_request: Request, {params}: CommentsRoadContext): Promise<NextResponse> {
    const {idMovie, idComment} = await params;

    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
        return NextResponse.json({
            status: 400,
            message: 'Invalid movie ID or comment ID',
        });
    }

    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(COMMENTS)
            .deleteOne({
                _id: ObjectId.createFromHexString(idComment),
                movie_id: ObjectId.createFromHexString(idMovie),
            });

        if (result.deletedCount === 0) {
            return NextResponse.json({
                status: 404,
                message: 'Comment not found for this movie',
            });
        }

        return NextResponse.json({
            status: 200,
            message: 'Comment deleted successfully',
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}