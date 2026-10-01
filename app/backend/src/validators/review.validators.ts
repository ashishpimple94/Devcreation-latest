import { z } from 'zod';

export const createReviewSchema = {
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(2).max(150),
    comment: z.string().min(5).max(2000),
  }),
};
