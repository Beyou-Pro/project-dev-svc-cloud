// app/api/movies/route.js

import {NextResponse} from 'next/server';
import {Db, MongoClient} from 'mongodb';
import clientPromise from '@/lib/mongodb';
import {Theater, theaterSchema} from "@/app/schemas/theaterSchema";
import {DB_NAME, THEATERS} from "@/app/constants/constants";

export async function GET(): Promise<NextResponse> {
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const theaters = await db.collection(THEATERS)
            .find({})
            .limit(10)
            .toArray();

        return NextResponse.json({
            status: 200,
            data: theaters
        });
    } catch (error: any) {
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
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);
        const latestTheater = await db.collection(THEATERS)
            .find({})
            .sort({theaterId: -1})
            .limit(1)
            .toArray();

        const newTheaterId = latestTheater.length > 0 ? latestTheater[0].theaterId + 1 : 1;
        const dataToValidate = {
            ...body,
            theaterId: newTheaterId,
        };

        const theaterData: Theater = theaterSchema.parse(dataToValidate);
        const {_id, ...theaterWithoutId} = theaterData;
        const existingTheater = await db.collection(THEATERS)
            .findOne({
                "location.address.street1": theaterWithoutId.location.address.street1,
                "location.address.city": theaterWithoutId.location.address.city,
                "location.address.state": theaterWithoutId.location.address.state,
                "location.address.zipcode": theaterWithoutId.location.address.zipcode,
            });

        if (existingTheater) {
            return NextResponse.json({
                status: 400,
                message: 'Theater already exists',
            });
        }

        const result = await db.collection(THEATERS)
            .insertOne(theaterWithoutId);

        return NextResponse.json({
            status: 201,
            data: {insertedId: result.insertedId, theaterId: newTheaterId},
            message: 'Theater created',
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

export async function PUT(): Promise<NextResponse> {
    return NextResponse.json({status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported'});
}

export async function DELETE(): Promise<NextResponse> {
    return NextResponse.json({status: 405, message: 'Method Not Allowed', error: 'DELETE method is not supported'});
}