// app/api/movies/route.js

import {NextResponse} from 'next/server';
import {Db, MongoClient} from 'mongodb';
import clientPromise from '@/lib/mongodb';
import {movieSchema} from '@/app/schemas/movieSchema';
import {DB_NAME, MOVIES} from "@/app/constants/constants";

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Retrieve a list of movies
 *     description: Fetches the first 10 movies from the database
 *     tags:
 *       - Movies
 *     responses:
 *       200:
 *         description: A list of movies
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
 *                       - plot
 *                       - genres
 *                       - num_mflix_comments
 *                       - title
 *                       - year
 *                     properties:
 *                       _id:
 *                         type: object
 *                         properties:
 *                           $oid:
 *                             type: string
 *                             example: "573a1390f29313caabcd446f"
 *                       plot:
 *                         type: string
 *                         description: Brief plot summary
 *                         example: "A greedy tycoon decides, on a whim, to corner the world market in wheat. This doubles the price of bread, forcing the grain's producers into charity lines and further into poverty. The film..."
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Movie genres
 *                         example: ["Short", "Drama"]
 *                       runtime:
 *                         type: object
 *                         properties:
 *                           $numberInt:
 *                             type: string
 *                             example: "14"
 *                       cast:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of actors
 *                         example: ["Frank Powell", "Grace Henderson", "James Kirkwood", "Linda Arvidson"]
 *                       num_mflix_comments:
 *                         type: object
 *                         properties:
 *                           $numberInt:
 *                             type: string
 *                             example: "1"
 *                       title:
 *                         type: string
 *                         description: The movie title
 *                         example: "A Corner in Wheat"
 *                       fullplot:
 *                         type: string
 *                         description: Complete plot summary
 *                         example: "A greedy tycoon decides, on a whim, to corner the world market in wheat. This doubles the price of bread, forcing the grain's producers into charity lines and further into poverty. The film continues to contrast the ironic differences between the lives of those who work to grow the wheat and the life of the man who dabbles in its sale for profit."
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Languages available
 *                         example: ["English"]
 *                       released:
 *                         type: object
 *                         properties:
 *                           $date:
 *                             type: object
 *                             properties:
 *                               $numberLong:
 *                                 type: string
 *                                 description: Release date as Unix timestamp in milliseconds
 *                                 example: "-1895097600000"
 *                       directors:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Movie directors
 *                         example: ["D.W. Griffith"]
 *                       rated:
 *                         type: string
 *                         description: Movie rating
 *                         example: "G"
 *                       awards:
 *                         type: object
 *                         properties:
 *                           wins:
 *                             type: object
 *                             properties:
 *                               $numberInt:
 *                                 type: string
 *                                 example: "1"
 *                           nominations:
 *                             type: object
 *                             properties:
 *                               $numberInt:
 *                                 type: string
 *                                 example: "0"
 *                           text:
 *                             type: string
 *                             description: Text describing awards
 *                             example: "1 win."
 *                       lastupdated:
 *                         type: string
 *                         description: Last update timestamp
 *                         example: "2015-08-13 00:46:30.660000000"
 *                       year:
 *                         type: object
 *                         properties:
 *                           $numberInt:
 *                             type: string
 *                             example: "1909"
 *                       imdb:
 *                         type: object
 *                         properties:
 *                           rating:
 *                             type: object
 *                             properties:
 *                               $numberDouble:
 *                                 type: string
 *                                 example: "6.6"
 *                           votes:
 *                             type: object
 *                             properties:
 *                               $numberInt:
 *                                 type: string
 *                                 example: "1375"
 *                           id:
 *                             type: object
 *                             properties:
 *                               $numberInt:
 *                                 type: string
 *                                 example: "832"
 *                       countries:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Countries of origin
 *                         example: ["USA"]
 *                       type:
 *                         type: string
 *                         description: Content type
 *                         example: "movie"
 *                       tomatoes:
 *                         type: object
 *                         properties:
 *                           viewer:
 *                             type: object
 *                             properties:
 *                               rating:
 *                                 type: object
 *                                 properties:
 *                                   $numberDouble:
 *                                     type: string
 *                                     example: "3.6"
 *                               numReviews:
 *                                 type: object
 *                                 properties:
 *                                   $numberInt:
 *                                     type: string
 *                                     example: "109"
 *                               meter:
 *                                 type: object
 *                                 properties:
 *                                   $numberInt:
 *                                     type: string
 *                                     example: "73"
 *                           lastUpdated:
 *                             type: object
 *                             properties:
 *                               $date:
 *                                 type: object
 *                                 properties:
 *                                   $numberLong:
 *                                     type: string
 *                                     example: "1431369413000"
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
        const movies = await db.collection(MOVIES)
            .find({})
            .limit(10)
            .toArray();

        return NextResponse.json({status: 200, data: movies}, {status: 200});
    } catch (error: any) {
        console.error("Error fetching movies:", error);
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message
        }, {status: 500});
    }
}

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Create a new movie
 *     description: Adds a new movie to the database
 *     tags:
 *       - Movies
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
 *               plot:
 *                 type: string
 *                 description: Brief plot summary
 *                 example: "A determined filmmaker documents the lives of struggling artists in a small town."
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Movie genres
 *                 example: ["Documentary", "Drama"]
 *               runtime:
 *                 type: number
 *                 description: Movie duration in minutes
 *                 example: 105
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of actors
 *                 example: ["John Smith", "Jane Doe"]
 *               num_mflix_comments:
 *                 type: number
 *                 description: Number of comments
 *                 example: 0
 *               title:
 *                 type: string
 *                 description: The movie title
 *                 example: "Creative Sparks"
 *               fullplot:
 *                 type: string
 *                 description: Complete plot summary
 *                 example: "A determined filmmaker moves to a small artistic community to document the lives and struggles of local artists. As she becomes more involved in their world, the line between observer and participant begins to blur."
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Languages available
 *                 example: ["English", "French"]
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Movie directors
 *                 example: ["Emily Johnson"]
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
 *                     example: 0
 *                   nominations:
 *                     type: number
 *                     description: Number of award nominations
 *                     example: 2
 *                   text:
 *                     type: string
 *                     description: Text describing awards
 *                     example: "2 nominations."
 *               year:
 *                 type: number
 *                 description: Release year
 *                 example: 2023
 *               imdb:
 *                 type: object
 *                 properties:
 *                   rating:
 *                     type: number
 *                     description: IMDB rating
 *                     example: 7.2
 *                   votes:
 *                     type: number
 *                     description: Number of votes on IMDB
 *                     example: 523
 *                   id:
 *                     type: number
 *                     description: IMDB ID
 *                     example: 8675309
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Countries of origin
 *                 example: ["USA", "Canada"]
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
 *                         example: 3.8
 *                       numReviews:
 *                         type: number
 *                         description: Number of viewer reviews
 *                         example: 86
 *                       meter:
 *                         type: number
 *                         description: Viewer meter percentage
 *                         example: 78
 *                   critic:
 *                     type: object
 *                     properties:
 *                       rating:
 *                         type: number
 *                         description: Critic rating
 *                         example: 7.5
 *                       numReviews:
 *                         type: number
 *                         description: Number of critic reviews
 *                         example: 12
 *                       meter:
 *                         type: number
 *                         description: Critic meter percentage
 *                         example: 83
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Movie created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                       example: true
 *                     insertedId:
 *                       type: object
 *                       properties:
 *                         $oid:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Invalid movie data
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
 *                   example: "Invalid movie data"
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
        const movieData = movieSchema.safeParse(body);
        const client: MongoClient = await clientPromise;
        const db: Db = client.db(DB_NAME);

        if (!movieData.success) {
            return NextResponse.json({
                status: 400,
                message: 'Invalid movie data',
                errors: movieData.error.errors,
            }, {status: 400});
        }

        const result = await db.collection(MOVIES)
            .insertOne(movieData.data);

        return NextResponse.json({
            status: 201,
            message: 'Movie created successfully',
            data: result,
        }, {status: 201});
    } catch (error: any) {
        console.error("Error creating movie:", error);
        return NextResponse.json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        }, {status: 500});
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