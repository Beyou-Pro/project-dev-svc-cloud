import { z } from 'zod';
import {ObjectId} from "mongodb";

export const theaterSchema = z.object({
    _id: z.instanceof(ObjectId).optional(),
    theaterId: z.number(),
    location: z.object({
        address: z.object({
            street1: z.string(),
            city: z.string(),
            state: z.string(),
            zipcode: z.string(),
        }),
        geo: z.object({
            type: z.literal('Point'),
            coordinates: z.tuple([z.number(), z.number()]),
        }),
    }),
});

export type Theater = z.infer<typeof theaterSchema>;
export type DBTheater = Omit<Theater, '_id'> & { _id: ObjectId };
export const theaterUpdateSchema = theaterSchema.omit({ _id: true, theaterId: true });