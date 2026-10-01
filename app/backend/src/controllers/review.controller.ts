import type { Request, Response } from 'express';
import { reviewService } from '@/services/review.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const reviewController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await reviewService.listByProduct(req.params.idOrSlug);
    return sendSuccess(res, data, 'Reviews fetched successfully');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.params.idOrSlug, req.user!.id, req.body);
    return sendSuccess(res, review, 'Review added successfully', 201);
  }),

  markHelpful: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.markHelpful(req.params.id);
    return sendSuccess(res, review, 'Review marked as helpful');
  }),
};
