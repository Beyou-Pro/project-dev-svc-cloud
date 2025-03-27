// app/api/movies/route.js

import { NextResponse } from 'next/server';
import { Db, MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const movies = await db.collection('theaters').find({}).limit(10).toArray();
    
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


export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported' });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ status: 405, message: 'Method Not Allowed', error: 'DELETE method is not supported' });
}