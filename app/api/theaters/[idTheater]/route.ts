import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Db, MongoClient, ObjectId} from 'mongodb';
import {DBTheater, theaterUpdateSchema} from "@/app/schemas/theaterSchema";
import {DB_NAME, THEATERS} from "@/app/constants/constants";
import {TheaterRoadContext} from "@/app/interface/theaterInterface";

export async function GET(_request: Request, {params}: TheaterRoadContext): Promise<NextResponse> {
    const {idTheater} = await params;

    if (!ObjectId.isValid(idTheater)) {
        return NextResponse.json({
            status: 400,
            message: "Invalid Theater ID",
            error: "ID format is incorrect",
        });
    }
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const objectId: ObjectId = ObjectId.createFromHexString(idTheater);
        const Theater: DBTheater | null = await db
            .collection<DBTheater>(THEATERS)
            .findOne({_id: objectId});

        if (!Theater) {
            return NextResponse.json({
                status: 404,
                message: "Theater not found",
                error: "No Theater found with the given ID",
            });
        }

        return NextResponse.json({status: 200, data: {Theater}});
    } catch (error: any) {
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

export async function PUT(request: Request, {params}: TheaterRoadContext): Promise<NextResponse> {
    const {idTheater} = await params;

    if (!ObjectId.isValid(idTheater)) {
        return NextResponse.json({
            status: 400,
            message: "Invalid Theater ID",
            error: "ID format is incorrect",
        });
    }

    try {
        const body = await request.json();
        const updateData = theaterUpdateSchema.parse(body);
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(THEATERS)
            .updateOne(
                {_id: ObjectId.createFromHexString(idTheater)},
                {$set: updateData}
            );

        if (result.matchedCount === 0) {
            return NextResponse.json({
                status: 404,
                message: "Theater not found",
            });
        }

        return NextResponse.json({
            status: 200,
            message: "Theater updated",
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({
                status: 400,
                message: "Validation error",
                errors: error.message,
            });
        }
        if (error instanceof Error) {
            return NextResponse.json({
                status: 500,
                message: "Internal Server Error",
                error: error.message,
            });
        }
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: "Unknown error",
        });
    }
}

export async function DELETE(_request: Request, {params}: TheaterRoadContext): Promise<NextResponse> {
    const {idTheater} = await params;

    if (!ObjectId.isValid(idTheater)) {
        return NextResponse.json({
            status: 400,
            message: "Invalid Theater ID",
            error: "ID format is incorrect",
        });
    }
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const result = await db.collection(THEATERS)
            .deleteOne({_id: ObjectId.createFromHexString(idTheater)});

        if (result.deletedCount === 0) {
            return NextResponse.json({
                status: 404,
                message: "Theater not found",
            });
        }
        return NextResponse.json({
            status: 200,
            message: "Theater deleted",
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({
                status: 500,
                message: "Internal Server Error",
                error: error.message,
            });
        }
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: "Unknown error",
        });
    }
}

export async function POST(): Promise<NextResponse> {
    return NextResponse.json({status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported'});
}
