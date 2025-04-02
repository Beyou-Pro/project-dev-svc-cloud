// app/api/theaters/route.ts

import {NextResponse} from 'next/server';
import {Db, MongoClient} from 'mongodb';
import clientPromise from '@/lib/mongodb';
import {Theater, theaterSchema} from "@/app/schemas/theaterSchema";
import {DB_NAME, THEATERS} from "@/app/constants/constants";

/**
 * @swagger
 * /api/theaters:
 *   get:
 *     summary: Retrieve a list of theaters
 *     description: Fetches the first 10 theaters from the database
 *     tags:
 *       - Theaters
 *     responses:
 *       200:
 *         description: A list of theaters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - theaterId
 *                       - location
 *                     properties:
 *                       _id:
 *                         type: string
 *                         format: objectId
 *                         example: "609c17fc1b8bed0021c89c12"
 *                       theaterId:
 *                         type: integer
 *                         description: Unique identifier for the theater
 *                         example: 1001
 *                       location:
 *                         type: object
 *                         required:
 *                           - address
 *                           - geo
 *                         properties:
 *                           address:
 *                             type: object
 *                             required:
 *                               - street1
 *                               - city
 *                               - state
 *                               - zipcode
 *                             properties:
 *                               street1:
 *                                 type: string
 *                                 description: Street address
 *                                 example: "340 W Market"
 *                               city:
 *                                 type: string
 *                                 description: City name
 *                                 example: "Bloomington"
 *                               state:
 *                                 type: string
 *                                 description: State code
 *                                 example: "MN"
 *                               zipcode:
 *                                 type: string
 *                                 description: ZIP code
 *                                 example: "55425"
 *                           geo:
 *                             type: object
 *                             required:
 *                               - type
 *                               - coordinates
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 enum: [Point]
 *                                 description: GeoJSON type
 *                                 example: "Point"
 *                               coordinates:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                                 minItems: 2
 *                                 maxItems: 2
 *                                 description: Longitude and latitude coordinates
 *                                 example: [-93.24565, 44.85466]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   description: Error message details
 */
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

/**
 * @swagger
 * /api/theaters:
 *   post:
 *     summary: Create a new theater
 *     description: Adds a new theater to the database
 *     tags:
 *       - Theaters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: object
 *                 required:
 *                   - address
 *                   - geo
 *                 properties:
 *                   address:
 *                     type: object
 *                     required:
 *                       - street1
 *                       - city
 *                       - state
 *                       - zipcode
 *                     properties:
 *                       street1:
 *                         type: string
 *                         description: Street address
 *                         example: "1234 Cinema Drive"
 *                       city:
 *                         type: string
 *                         description: City name
 *                         example: "Los Angeles"
 *                       state:
 *                         type: string
 *                         description: State code
 *                         example: "CA"
 *                       zipcode:
 *                         type: string
 *                         description: ZIP code
 *                         example: "90210"
 *                   geo:
 *                     type: object
 *                     required:
 *                       - type
 *                       - coordinates
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [Point]
 *                         description: GeoJSON type
 *                         example: "Point"
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                         minItems: 2
 *                         maxItems: 2
 *                         description: Longitude and latitude coordinates
 *                         example: [-118.40853, 34.10927]
 *     responses:
 *       201:
 *         description: Theater created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     insertedId:
 *                       type: string
 *                       format: objectId
 *                       example: "609c17fc1b8bed0021c89c12"
 *                     theaterId:
 *                       type: integer
 *                       example: 1001
 *                 message:
 *                   type: string
 *                   example: "Theater created"
 *       400:
 *         description: Validation error or theater already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Validation error"
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "invalid_type"
 *                           expected:
 *                             type: string
 *                             example: "string"
 *                           received:
 *                             type: string
 *                             example: "undefined"
 *                           path:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["location", "address", "street1"]
 *                           message:
 *                             type: string
 *                             example: "Required"
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Theater already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: string
 *                   description: Error message details
 */
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