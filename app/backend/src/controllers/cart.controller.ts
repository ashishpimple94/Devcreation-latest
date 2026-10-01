import type { Request, Response } from 'express';
import { cartService } from '@/services/cart.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.get(req.user!.id);
    return sendSuccess(res, cart, 'Cart fetched');
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, variantSku } = req.body;
    const cart = await cartService.addItem(req.user!.id, productId, quantity, variantSku);
    return sendSuccess(res, cart, 'Item added to cart');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, variantSku } = req.body;
    const cart = await cartService.updateItem(req.user!.id, productId, quantity, variantSku);
    return sendSuccess(res, cart, 'Cart updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(req.user!.id, req.params.productId, req.query.variantSku as string | undefined);
    return sendSuccess(res, cart, 'Item removed');
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clear(req.user!.id);
    return sendSuccess(res, cart, 'Cart cleared');
  }),
};
