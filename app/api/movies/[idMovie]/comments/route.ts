// app/api/movies/[idMovie]/comments/route.ts

import {NextResponse} from 'next/server';
import {Db, MongoClient} from "mongodb";
import {ObjectId} from "bson";
import clientPromise from '@/lib/mongodb';
import {commentSchema} from "@/app/schemas/commentSchema";
import {COMMENTS, DB_NAME, MOVIES} from "@/app/constants/constants";
import {MoviesRoadContext} from "@/app/interface/movieInterface";

/**
 * @swagger
 * /api/movies/{idMovie}/comments:
 *   get:
 *     summary: Retrieve comments for a movie
 *     description: Fetches all comments associated with a specific movie ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Comment ID
 *                         example: "60f7a7d5a5f9a1b2c3d4e5f6"
 *                       name:
 *                         type: string
 *                         description: Commenter's name
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         description: Commenter's email
 *                         example: "john.doe@example.com"
 *                       movie_id:
 *                         type: string
 *                         description: Movie ID the comment belongs to
 *                         example: "573a1390f29313caabcd446f"
 *                       text:
 *                         type: string
 *                         description: Comment content
 *                         example: "This movie was amazing!"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         description: Comment timestamp
 *                         example: "2023-04-02T12:34:56.789Z"
 *       400:
 *         description: Invalid movie ID format
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
 *                   example: "Invalid movie ID"
 *                 error:
 *                   type: string
 *                   example: "ID format is incorrect"
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

/**
 * @swagger
 * /api/movies/{idMovie}/comments:
 *   post:
 *     summary: Create a new comment for a movie
 *     description: Adds a new comment associated with a specific movie ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - text
 *             properties:
 *               name:
 *                 type: string
 *                 description: Commenter's name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Commenter's email address
 *                 example: "john.doe@example.com"
 *               text:
 *                 type: string
 *                 description: The comment content
 *                 example: "This movie was fantastic! I especially loved the cinematography."
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                       description: ID of the newly created comment
 *                       example: "60f7a7d5a5f9a1b2c3d4e5f6"
 *                 message:
 *                   type: string
 *                   example: "Comment created successfully"
 *       400:
 *         description: Validation error or invalid movie ID
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
 *                   example: "Validation error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "invalid_string"
 *                       expected:
 *                         type: string
 *                         example: "email"
 *                       received:
 *                         type: string
 *                         example: "string"
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["email"]
 *                       message:
 *                         type: string
 *                         example: "Invalid email"
 *       404:
 *         description: Movie not found
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
 *                   example: "Movie not found"
 *                 error:
 *                   type: string
 *                   example: "No movie found with the given ID"
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