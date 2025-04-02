// app/api/movies/[idMovie]/route.ts

import {NextResponse} from 'next/server';
import {Db, MongoClient, ObjectId} from 'mongodb';
import {movieSchema} from "@/app/schemas/movieSchema";
import clientPromise from '@/lib/mongodb';
import {DB_NAME, MOVIES} from "@/app/constants/constants";
import {MoviesRoadContext} from "@/app/interface/movieInterface";

export async function GET(_request: Request, {params}: MoviesRoadContext): Promise<NextResponse> {
    const {idMovie} = await params;

    try {
        const client: MongoClient = await clientPromise;
        const db = client.db(DB_NAME);

        if (!ObjectId.isValid(idMovie)) {
            return NextResponse.json({status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect'});
        }

        const movie = await db.collection(MOVIES)
            .findOne({_id: ObjectId.createFromHexString(idMovie)});

        if (!movie) {
            return NextResponse.json({
                status: 404,
                message: 'Movie not found',
                error: 'No movie found with the given ID'
            });
        }

        return NextResponse.json({status: 200, data: {movie}});
    } catch (error: any) {
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export async function PUT(request: Request, {params}: MoviesRoadContext): Promise<NextResponse> {
    const {idMovie} = await params;

    try {
        const body = await request.json();
        if (typeof body._id === 'string') {
            body._id = ObjectId.createFromHexString(body._id);
        }
        const movieData = movieSchema.parse(body);
        const {_id, ...updateData} = movieData;
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(MOVIES)
            .updateOne(
                {_id: ObjectId.createFromHexString(idMovie)},
                {$set: updateData}
            );
        if (result.matchedCount === 0) {
            return NextResponse.json({
                status: 404,
                message: 'Movie not found'
            });
        }
        return NextResponse.json({
            status: 200,
            message: 'Movie updated'
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({
                status: 400,
                message: 'Validation error',
                errors: Array.isArray(error.errors) ? error.errors : [error.message]
            });
        }
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const {_id, ...data} = body;
        const movieData = movieSchema.parse(data);
        const client = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(MOVIES)
            .insertOne(movieData);

        return NextResponse.json({
            status: 201,
            data: {insertedId: result.insertedId},
            message: 'Movie created'
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({
                status: 400,
                message: 'Validation error',
                errors: error.errors
            });
        }

        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export async function DELETE(_request: Request, {params}: MoviesRoadContext): Promise<NextResponse> {
    const {idMovie} = await params;

    try {
        const client = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(MOVIES)
            .deleteOne({_id: ObjectId.createFromHexString(idMovie)});

        if (result.deletedCount === 0) {
            return NextResponse.json({
                status: 404,
                message: "Movie not found",
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Movie deleted",
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}
