// app/api/theaters/[idTheater]/route.ts

import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Db, MongoClient, ObjectId} from 'mongodb';
import {DBTheater, theaterUpdateSchema} from "@/app/schemas/theaterSchema";
import {DB_NAME, THEATERS} from "@/app/constants/constants";
import {TheaterRoadContext} from "@/app/interface/theaterInterface";

/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   get:
 *     summary: Get theater by ID
 *     description: Retrieves a specific theater by its MongoDB ID
 *     tags:
 *       - Theaters
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: MongoDB ID of the theater
 *         example: "609c17fc1b8bed0021c89c12"
 *     responses:
 *       200:
 *         description: Theater found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     Theater:
 *                       type: object
 *                       required:
 *                         - _id
 *                         - theaterId
 *                         - location
 *                       properties:
 *                         _id:
 *                           type: string
 *                           format: objectId
 *                           example: "609c17fc1b8bed0021c89c12"
 *                         theaterId:
 *                           type: integer
 *                           description: Unique identifier for the theater
 *                           example: 1001
 *                         location:
 *                           type: object
 *                           required:
 *                             - address
 *                             - geo
 *                           properties:
 *                             address:
 *                               type: object
 *                               required:
 *                                 - street1
 *                                 - city
 *                                 - state
 *                                 - zipcode
 *                               properties:
 *                                 street1:
 *                                   type: string
 *                                   description: Street address
 *                                   example: "340 W Market"
 *                                 city:
 *                                   type: string
 *                                   description: City name
 *                                   example: "Bloomington"
 *                                 state:
 *                                   type: string
 *                                   description: State code
 *                                   example: "MN"
 *                                 zipcode:
 *                                   type: string
 *                                   description: ZIP code
 *                                   example: "55425"
 *                             geo:
 *                               type: object
 *                               required:
 *                                 - type
 *                                 - coordinates
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                   enum: [Point]
 *                                   description: GeoJSON type
 *                                   example: "Point"
 *                                 coordinates:
 *                                   type: array
 *                                   items:
 *                                     type: number
 *                                   minItems: 2
 *                                   maxItems: 2
 *                                   description: Longitude and latitude coordinates
 *                                   example: [-93.24565, 44.85466]
 *       400:
 *         description: Invalid theater ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Theater ID"
 *                 error:
 *                   type: string
 *                   example: "ID format is incorrect"
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Theater not found"
 *                 error:
 *                   type: string
 *                   example: "No Theater found with the given ID"
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

/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   put:
 *     summary: Update a theater
 *     description: Updates a specific theater by its MongoDB ID
 *     tags:
 *       - Theaters
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: MongoDB ID of the theater
 *         example: "609c17fc1b8bed0021c89c12"
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
 *       200:
 *         description: Theater updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Theater updated"
 *       400:
 *         description: Invalid theater ID or validation error
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
 *                       example: "Invalid Theater ID"
 *                     error:
 *                       type: string
 *                       example: "ID format is incorrect"
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 400
 *                     message:
 *                       type: string
 *                       example: "Validation error"
 *                     errors:
 *                       type: string
 *                       description: ZodError message
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Theater not found"
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

/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   delete:
 *     summary: Delete a theater
 *     description: Deletes a specific theater by its MongoDB ID
 *     tags:
 *       - Theaters
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: MongoDB ID of the theater
 *         example: "609c17fc1b8bed0021c89c12"
 *     responses:
 *       200:
 *         description: Theater deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Theater deleted"
 *       400:
 *         description: Invalid theater ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid Theater ID"
 *                 error:
 *                   type: string
 *                   example: "ID format is incorrect"
 *       404:
 *         description: Theater not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Theater not found"
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