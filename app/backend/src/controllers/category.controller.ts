import type { Request, Response } from 'express';
import { categoryService } from '@/services/category.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const categoryController = {
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    const items = await categoryService.listActive();
    return sendSuccess(res, items, 'Categories fetched');
  }),

  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const items = await categoryService.listAll();
    return sendSuccess(res, items, 'Categories fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, 'Category created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    return sendSuccess(res, category, 'Category updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.remove(req.params.id);
    return sendSuccess(res, result, 'Category deleted');
  }),
};
