import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Db, MongoClient, ObjectId} from 'mongodb';

interface TheaterParams {
    idTheater: string;
}

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const {searchParams} = new URL(request.url);
        const idTheater = searchParams.get("idTheater");

        if (!idTheater || !ObjectId.isValid(idTheater)) {
            return NextResponse.json(
                {status: 400, message: "Invalid theater ID", error: "ID format is incorrect"},
                {status: 400}
            );
        }

        const client: MongoClient = await clientPromise;
        const db: Db = client.db("sample_mflix");

        const theater = await db.collection("theaters").findOne({_id: new ObjectId(idTheater)});

        if (!theater) {
            return NextResponse.json(
                {status: 404, message: "Theater not found", error: "No theater found with the given ID"},
                {status: 404}
            );
        }

        return NextResponse.json({status: 200, data: theater}, {status: 200});

    } catch (error: any) {
        console.error("Error fetching theater:", error);
        return NextResponse.json(
            {status: 500, message: "Internal Server Error", error: error.message},
            {status: 500}
        );
    }
}


export async function POST(): Promise<NextResponse> {
    return NextResponse.json({status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported'});
}

// POST Route

/* export async function PUT(req: Request, { params }: { params: TheaterParams }): Promise<NextResponse> {
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db('sample_mflix');
        const { idTheater } = params;
        const body = await req.json();

        if (!ObjectId.isValid(idTheater)) {
            return NextResponse.json({ status: 400, message: 'Invalid theater ID', error: 'ID format is incorrect' });
        }

        const result = await db.collection('theaters').updateOne(
            { _id: new ObjectId(idTheater) },
            { $set: body }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Theater not found' });
        }

        return NextResponse.json({ status: 200, message: 'Theater updated' });
    } catch (error: any) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
*/

/*
export async function DELETE(req: Request, {params}: { params: TheaterParams }): Promise<NextResponse> {
    try {
        const client: MongoClient = await clientPromise;
        const db: Db = client.db('sample_mflix');
        const {idTheater} = params;

        if (!ObjectId.isValid(idTheater)) {
            return NextResponse.json({status: 400, message: 'Invalid theater ID', error: 'ID format is incorrect'});
        }

        const result = await db.collection('theaters').deleteOne({_id: new ObjectId(idTheater)});

        if (result.deletedCount === 0) {
            return NextResponse.json({status: 404, message: 'Theater not found'});
        }

        return NextResponse.json({status: 200, message: 'Theater deleted'});
    } catch (error: any) {
        return NextResponse.json({status: 500, message: 'Internal Server Error', error: error.message});
    }
}
*/