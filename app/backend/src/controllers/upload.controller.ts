import type { Request, Response } from 'express';
import { storageService } from '@/services/storage.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiError } from '@/utils/ApiError';

export const uploadController = {
  images: asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) throw ApiError.badRequest('No images were uploaded');
    const stored = await Promise.all(files.map((f) => storageService.save(f)));
    return sendSuccess(res, stored, 'Images uploaded', 201);
  }),
};
