import {NextResponse} from 'next/server';
import {Db, MongoClient} from 'mongodb';
import {ObjectId} from 'bson';
import {COMMENTS, DB_NAME} from "@/app/constants/constants";
import clientPromise from '@/lib/mongodb';
import {commentSchema} from "@/app/schemas/commentSchema";
import {CommentsRoadContext} from "@/app/interface/commentInterface";

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   get:
 *     summary: Retrieve a specific comment for a movie
 *     description: Fetches a single comment using its ID for a specific movie
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         required: true
 *         description: MongoDB ObjectId of the comment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
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
 *                     _id:
 *                       type: string
 *                       description: Comment ID
 *                       example: "60f7a7d5a5f9a1b2c3d4e5f6"
 *                     name:
 *                       type: string
 *                       description: Commenter's name
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: Commenter's email
 *                       example: "john.doe@example.com"
 *                     movie_id:
 *                       type: string
 *                       description: Movie ID the comment belongs to
 *                       example: "573a1390f29313caabcd446f"
 *                     text:
 *                       type: string
 *                       description: Comment content
 *                       example: "This movie was amazing!"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Comment timestamp
 *                       example: "2023-04-02T12:34:56.789Z"
 *       400:
 *         description: Invalid ID format
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
 *                   example: "Invalid movie ID or comment ID"
 *       404:
 *         description: Comment not found
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
 *                   example: "Comment not found for this movie"
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

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   put:
 *     summary: Update a specific comment
 *     description: Updates an existing comment for a specific movie
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         required: true
 *         description: MongoDB ObjectId of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: The updated comment content
 *                 example: "After thinking about this movie more, I have some additional thoughts..."
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: "Comment updated successfully"
 *       400:
 *         description: Validation error or invalid ID format
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
 *         description: Comment not found
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
 *                   example: "Comment not found for this movie"
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

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   delete:
 *     summary: Delete a specific comment
 *     description: Removes a specific comment from a movie
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *       - in: path
 *         name: idComment
 *         required: true
 *         description: MongoDB ObjectId of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: "Comment deleted successfully"
 *       400:
 *         description: Invalid ID format
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
 *                   example: "Invalid movie ID or comment ID"
 *       404:
 *         description: Comment not found
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
 *                   example: "Comment not found for this movie"
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