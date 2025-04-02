import {NextResponse} from 'next/server';
import {Db, MongoClient} from "mongodb";
import {ObjectId} from "bson";
import clientPromise from '@/lib/mongodb';
import {commentSchema} from "@/app/schemas/commentSchema";
import {COMMENTS, DB_NAME, MOVIES} from "@/app/constants/constants";
import {MoviesRoadContext} from "@/app/interface/movieInterface";

export async function GET(_request: Request, {params}: MoviesRoadContext): Promise<NextResponse> {
    const {idMovie} = await params;

    if (!ObjectId.isValid(idMovie)) {
        return NextResponse.json({
            status: 400,
            message: 'Invalid movie ID',
            error: 'ID format is incorrect',
        });
    }

    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const comments: Comment[] = await db
            .collection<Comment>(COMMENTS)
            .find({movie_id: ObjectId.createFromHexString(idMovie)})
            .toArray();

        if (comments.length === 0) {
            return NextResponse.json({
                status: 200,
                message: 'No comments available for this movie.',
                data: [],
            });
        }

        return NextResponse.json({
            status: 200,
            data: comments,
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function POST(request: Request, {params}: MoviesRoadContext): Promise<NextResponse> {
    const {idMovie} = await params;

    if (!ObjectId.isValid(idMovie)) {
        return NextResponse.json({
            status: 400,
            message: 'Invalid movie ID',
            error: 'ID format is incorrect',
        });
    }

    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const movieExists = await db.collection(MOVIES)
            .findOne({_id: ObjectId.createFromHexString(idMovie)});

        if (!movieExists) {
            return NextResponse.json({
                status: 404,
                message: 'Movie not found',
                error: 'No movie found with the given ID',
            });
        }

        const body = await request.json();
        const commentToValidate = {
            ...body,
            movie_id: ObjectId.createFromHexString(idMovie),
            date: new Date(),
        };

        const validCommentData = commentSchema.omit({_id: true}).parse(commentToValidate);
        const result = await db.collection(COMMENTS).insertOne(validCommentData);

        return NextResponse.json({
            status: 201,
            data: {insertedId: result.insertedId},
            message: 'Comment created successfully',
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({
                status: 400,
                message: 'Validation error',
                errors: error.errors,
            });
        }

        console.error('Error inserting comment:', error);

        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function PUT(): Promise<NextResponse> {
    return NextResponse.json({
        status: 405,
        message: 'Method Not Allowed',
        error: 'PUT method is not supported'
    });
}

export async function DELETE(): Promise<NextResponse> {
    return NextResponse.json({
        status: 405,
        message: 'Method Not Allowed',
        error: 'DELETE method is not supported'
    });
}