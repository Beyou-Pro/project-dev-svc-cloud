// app/api/movies/[idMovie]/route.ts

import {NextResponse} from 'next/server';
import {Db, MongoClient, ObjectId} from 'mongodb';
import {movieSchema} from "@/app/schemas/movieSchema";
import clientPromise from '@/lib/mongodb';
import {DB_NAME, MOVIES} from "@/app/constants/constants";
import {MoviesRoadContext} from "@/app/interface/movieInterface";

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   get:
 *     summary: Retrieve a movie by ID
 *     description: Fetches a single movie from the database using its ObjectId
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie found
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
 *                     movie:
 *                       type: object
 *                       required:
 *                         - plot
 *                         - genres
 *                         - num_mflix_comments
 *                         - title
 *                         - year
 *                       properties:
 *                         _id:
 *                           type: object
 *                           properties:
 *                             $oid:
 *                               type: string
 *                               example: "573a1390f29313caabcd446f"
 *                         plot:
 *                           type: string
 *                           description: Brief plot summary
 *                           example: "A greedy tycoon decides, on a whim, to corner the world market in wheat. This doubles the price of bread, forcing the grain's producers into charity lines and further into poverty. The film..."
 *                         genres:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Movie genres
 *                           example: ["Short", "Drama"]
 *                         runtime:
 *                           type: object
 *                           properties:
 *                             $numberInt:
 *                               type: string
 *                               example: "14"
 *                         cast:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: List of actors
 *                           example: ["Frank Powell", "Grace Henderson", "James Kirkwood", "Linda Arvidson"]
 *                         num_mflix_comments:
 *                           type: object
 *                           properties:
 *                             $numberInt:
 *                               type: string
 *                               example: "1"
 *                         title:
 *                           type: string
 *                           description: The movie title
 *                           example: "A Corner in Wheat"
 *                         fullplot:
 *                           type: string
 *                           description: Complete plot summary
 *                           example: "A greedy tycoon decides, on a whim, to corner the world market in wheat. This doubles the price of bread, forcing the grain's producers into charity lines and further into poverty. The film continues to contrast the ironic differences between the lives of those who work to grow the wheat and the life of the man who dabbles in its sale for profit."
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Languages available
 *                           example: ["English"]
 *                         released:
 *                           type: object
 *                           properties:
 *                             $date:
 *                               type: object
 *                               properties:
 *                                 $numberLong:
 *                                   type: string
 *                                   description: Release date as Unix timestamp in milliseconds
 *                                   example: "-1895097600000"
 *                         directors:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Movie directors
 *                           example: ["D.W. Griffith"]
 *                         rated:
 *                           type: string
 *                           description: Movie rating
 *                           example: "G"
 *                         awards:
 *                           type: object
 *                           properties:
 *                             wins:
 *                               type: object
 *                               properties:
 *                                 $numberInt:
 *                                   type: string
 *                                   example: "1"
 *                             nominations:
 *                               type: object
 *                               properties:
 *                                 $numberInt:
 *                                   type: string
 *                                   example: "0"
 *                             text:
 *                               type: string
 *                               description: Text describing awards
 *                               example: "1 win."
 *                         lastupdated:
 *                           type: string
 *                           description: Last update timestamp
 *                           example: "2015-08-13 00:46:30.660000000"
 *                         year:
 *                           type: object
 *                           properties:
 *                             $numberInt:
 *                               type: string
 *                               example: "1909"
 *                         imdb:
 *                           type: object
 *                           properties:
 *                             rating:
 *                               type: object
 *                               properties:
 *                                 $numberDouble:
 *                                   type: string
 *                                   example: "6.6"
 *                             votes:
 *                               type: object
 *                               properties:
 *                                 $numberInt:
 *                                   type: string
 *                                   example: "1375"
 *                             id:
 *                               type: object
 *                               properties:
 *                                 $numberInt:
 *                                   type: string
 *                                   example: "832"
 *                         countries:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Countries of origin
 *                           example: ["USA"]
 *                         type:
 *                           type: string
 *                           description: Content type
 *                           example: "movie"
 *                         tomatoes:
 *                           type: object
 *                           properties:
 *                             viewer:
 *                               type: object
 *                               properties:
 *                                 rating:
 *                                   type: object
 *                                   properties:
 *                                     $numberDouble:
 *                                       type: string
 *                                       example: "3.6"
 *                                 numReviews:
 *                                   type: object
 *                                   properties:
 *                                     $numberInt:
 *                                       type: string
 *                                       example: "109"
 *                                 meter:
 *                                   type: object
 *                                   properties:
 *                                     $numberInt:
 *                                       type: string
 *                                       example: "73"
 *                             lastUpdated:
 *                               type: object
 *                               properties:
 *                                 $date:
 *                                   type: object
 *                                   properties:
 *                                     $numberLong:
 *                                       type: string
 *                                       example: "1431369413000"
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

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   put:
 *     summary: Update a movie
 *     description: Updates a movie in the database using its ObjectId
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plot
 *               - genres
 *               - num_mflix_comments
 *               - title
 *               - year
 *             properties:
 *               _id:
 *                 type: string
 *                 description: MongoDB ObjectId (optional, will be ignored during update)
 *                 example: "573a1390f29313caabcd446f"
 *               plot:
 *                 type: string
 *                 description: Brief plot summary
 *                 example: "Updated plot description"
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Movie genres
 *                 example: ["Drama", "Thriller"]
 *               runtime:
 *                 type: number
 *                 description: Movie duration in minutes
 *                 example: 120
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of actors
 *                 example: ["Actor One", "Actor Two"]
 *               num_mflix_comments:
 *                 type: number
 *                 description: Number of comments
 *                 example: 5
 *               title:
 *                 type: string
 *                 description: The movie title
 *                 example: "Updated Movie Title"
 *               fullplot:
 *                 type: string
 *                 description: Complete plot summary
 *                 example: "This is the updated full plot of the movie with more details."
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Languages available
 *                 example: ["English", "Spanish"]
 *               released:
 *                 type: object
 *                 properties:
 *                   $date:
 *                     type: number
 *                     description: Release date as Unix timestamp in milliseconds
 *                     example: 1577836800000
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Movie directors
 *                 example: ["Director One", "Director Two"]
 *               rated:
 *                 type: string
 *                 description: Movie rating
 *                 example: "PG-13"
 *               awards:
 *                 type: object
 *                 properties:
 *                   wins:
 *                     type: number
 *                     description: Number of awards won
 *                     example: 2
 *                   nominations:
 *                     type: number
 *                     description: Number of award nominations
 *                     example: 5
 *                   text:
 *                     type: string
 *                     description: Text describing awards
 *                     example: "2 wins & 5 nominations."
 *               year:
 *                 type: number
 *                 description: Release year
 *                 example: 2020
 *               imdb:
 *                 type: object
 *                 properties:
 *                   rating:
 *                     type: number
 *                     description: IMDB rating
 *                     example: 7.5
 *                   votes:
 *                     type: number
 *                     description: Number of votes on IMDB
 *                     example: 1500
 *                   id:
 *                     type: number
 *                     description: IMDB ID
 *                     example: 12345
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Countries of origin
 *                 example: ["USA", "UK"]
 *               type:
 *                 type: string
 *                 description: Content type
 *                 example: "movie"
 *               tomatoes:
 *                 type: object
 *                 properties:
 *                   viewer:
 *                     type: object
 *                     properties:
 *                       rating:
 *                         type: number
 *                         description: Viewer rating
 *                         example: 4.2
 *                       numReviews:
 *                         type: number
 *                         description: Number of viewer reviews
 *                         example: 250
 *                       meter:
 *                         type: number
 *                         description: Viewer meter percentage
 *                         example: 85
 *                   critic:
 *                     type: object
 *                     properties:
 *                       rating:
 *                         type: number
 *                         description: Critic rating
 *                         example: 8.0
 *                       numReviews:
 *                         type: number
 *                         description: Number of critic reviews
 *                         example: 50
 *                       meter:
 *                         type: number
 *                         description: Critic meter percentage
 *                         example: 90
 *                   fresh:
 *                     type: number
 *                     description: Number of fresh reviews
 *                     example: 45
 *                   rotten:
 *                     type: number
 *                     description: Number of rotten reviews
 *                     example: 5
 *                   lastUpdated:
 *                     type: object
 *                     properties:
 *                       $date:
 *                         type: number
 *                         description: Last update timestamp
 *                         example: 1609459200000
 *     responses:
 *       200:
 *         description: Movie updated successfully
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
 *                   example: "Movie updated"
 *       400:
 *         description: Validation error
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
 *                         example: "invalid_type"
 *                       expected:
 *                         type: string
 *                         example: "string"
 *                       received:
 *                         type: string
 *                         example: "undefined"
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["plot"]
 *                       message:
 *                         type: string
 *                         example: "Required"
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

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   delete:
 *     summary: Delete a movie
 *     description: Removes a movie from the database using its ObjectId
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         description: MongoDB ObjectId of the movie to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
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
 *                   example: "Movie deleted"
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