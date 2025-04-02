import { z } from 'zod';
import { ObjectId } from "bson";

export const commentSchema = z.object({
    _id: z.instanceof(ObjectId),
    name: z.string(),
    email: z.string().email(),
    movie_id: z.instanceof(ObjectId),
    text: z.string(),
    date: z.preprocess(arg => {
        if (typeof arg === "string" || arg instanceof Date) {
            return new Date(arg);
        }
    }, z.date())
});

export type Comment = z.infer<typeof commentSchema>;