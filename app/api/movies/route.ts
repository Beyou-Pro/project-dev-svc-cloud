// app/api/movies/route.js

import { NextResponse } from 'next/server';
import { Db, MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { movieSchema } from '@/app/schemas/movieSchema';

/**
 * @swagger
 * /api/movies:
 *   get:
 *     description: Returns movies
 *     responses:
 *       200:
 *         description: desc
 */
export async function GET(): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const movies = await db.collection('movies').find({}).limit(10).toArray();
    
    return NextResponse.json(
	    { status: 200, data: movies }
		);
  }
  catch (error: any) {
    return NextResponse.json(
	    { status: 500, message: 'Internal Server Error', error: error.message }
    );
  }
}

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Add a new movie to the database
 *     description: Inserts a new movie document into the 'movies' collection with validation checks for required and optional fields.
 *     tags:
 *       - Movies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - plot
 *               - genres
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Great Train Robbery"
 *               plot:
 *                 type: string
 *                 example: "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels."
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Short", "Western"]
 *               runtime:
 *                 type: integer
 *                 example: 11
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A.C. Abadie", "Gilbert M. 'Broncho Billy' Anderson", "George Barnes"]
 *               poster:
 *                 type: string
 *                 format: url
 *                 example: "https://m.media-amazon.com/images/M/MV5BMTU3NjE5NzYtYTYyNS00MDVmLWIwYjgtMmYwYWIxZDYyNzU2XkEyXkFqcGdeQXVyNzQzNzQxNzI@._V1_SY1000_SX677_AL_.jpg"
 *               fullplot:
 *                 type: string
 *                 example: "Among the earliest existing films in American cinema - notable as the first film that presented a narrative story to tell."
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English"]
 *               released:
 *                 type: object
 *                 properties:
 *                   $date:
 *                     type: integer
 *                     example: -2085523200000
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Edwin S. Porter"]
 *               rated:
 *                 type: string
 *                 example: "TV-G"
 *               awards:
 *                 type: object
 *                 properties:
 *                   wins:
 *                     type: integer
 *                     example: 1
 *                   nominations:
 *                     type: integer
 *                     example: 0
 *                   text:
 *                     type: string
 *                     example: "1 win."
 *               year:
 *                 type: integer
 *                 example: 1903
 *               imdb:
 *                 type: object
 *                 properties:
 *                   rating:
 *                     type: number
 *                     example: 7.4
 *                   votes:
 *                     type: integer
 *                     example: 9847
 *                   id:
 *                     type: integer
 *                     example: 439
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["USA"]
 *               type:
 *                 type: string
 *                 example: "movie"
 *               tomatoes:
 *                 type: object
 *                 properties:
 *                   viewer:
 *                     type: object
 *                     properties:
 *                       rating:
 *                         type: number
 *                         example: 3.7
 *                       numReviews:
 *                         type: integer
 *                         example: 2559
 *                       meter:
 *                         type: integer
 *                         example: 75
 *                   critic:
 *                     type: object
 *                     properties:
 *                       rating:
 *                         type: number
 *                         example: 7.6
 *                       numReviews:
 *                         type: integer
 *                         example: 6
 *                       meter:
 *                         type: integer
 *                         example: 100
 *                   fresh:
 *                     type: integer
 *                     example: 6
 *                   rotten:
 *                     type: integer
 *                     example: 0
 *                   lastUpdated:
 *                     type: object
 *                     properties:
 *                       $date:
 *                         type: integer
 *                         example: 1439061370000
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
 *       400:
 *         description: Invalid movie data (missing or incorrect fields)
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
 *                       path:
 *                         type: string
 *                         example: "year"
 *                       message:
 *                         type: string
 *                         example: "Expected number, received string"
 *       500:
 *         description: Internal Server Error
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
 */
export async function POST(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const body = await request.json();

    const parsedData = movieSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid movie data',
        errors: parsedData.error.errors,
      });
    }

    const result = await db.collection('movies').insertOne(parsedData.data);

    return NextResponse.json({
      status: 201,
      message: 'Movie created successfully',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported' });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ status: 405, message: 'Method Not Allowed', error: 'DELETE method is not supported' });
}