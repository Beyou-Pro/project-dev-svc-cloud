import { z } from 'zod';

export const movieSchema = z.object({
    title: z.string(),
    plot: z.string(),
    genres: z.array(z.string()),
    runtime: z.number().optional(),
    cast: z.array(z.string()).optional(),
    poster: z.string().url().optional(),
    fullplot: z.string().optional(),
    languages: z.array(z.string()).optional(),
    released: z.object({ $date: z.number() }).optional(),
    directors: z.array(z.string()).optional(),
    rated: z.string().optional(),
    awards: z
      .object({
        wins: z.number().optional(),
        nominations: z.number().optional(),
        text: z.string().optional(),
      })
      .optional(),
    year: z.number(),
    imdb: z
      .object({
        rating: z.number().optional(),
        votes: z.number().optional(),
        id: z.number().optional(),
      })
      .optional(),
    countries: z.array(z.string()).optional(),
    type: z.string().optional(),
    tomatoes: z
      .object({
        viewer: z
          .object({
            rating: z.number().optional(),
            numReviews: z.number().optional(),
            meter: z.number().optional(),
          })
          .optional(),
        critic: z
          .object({
            rating: z.number().optional(),
            numReviews: z.number().optional(),
            meter: z.number().optional(),
          })
          .optional(),
        fresh: z.number().optional(),
        rotten: z.number().optional(),
        lastUpdated: z.object({ $date: z.number() }).optional(),
      })
      .optional(),
  });
  