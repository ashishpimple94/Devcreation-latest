import type { Request, Response } from 'express';
import { productService } from '@/services/product.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await productService.list(req.query);
    return sendSuccess(res, items, 'Products fetched', 200, meta);
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getByIdOrSlug(req.params.idOrSlug);
    return sendSuccess(res, product, 'Product fetched');
  }),

  related: asyncHandler(async (req: Request, res: Response) => {
    const items = await productService.related(req.params.idOrSlug);
    return sendSuccess(res, items, 'Related products fetched');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body, req.user!.id);
    return sendSuccess(res, product, 'Product created successfully', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.remove(req.params.id);
    return sendSuccess(res, result, 'Product deleted successfully');
  }),
};
