import type { Request, Response } from 'express';
import { giftCardService } from '@/services/giftCard.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const giftCardController = {
  validate: asyncHandler(async (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const result = await giftCardService.validate(code, Number(subtotal) || 0);
    return sendSuccess(res, result, `Promo code ${result.code} applied successfully!`);
  }),

  listAvailable: asyncHandler(async (_req: Request, res: Response) => {
    const codes = await giftCardService.listAll();
    return sendSuccess(res, codes, 'Available gift card codes fetched');
  }),

  adminList: asyncHandler(async (_req: Request, res: Response) => {
    const list = await giftCardService.listAll();
    return sendSuccess(res, list, 'All gift cards retrieved');
  }),

  adminCreate: asyncHandler(async (req: Request, res: Response) => {
    const created = await giftCardService.create(req.body);
    return sendSuccess(res, created, 'Gift card created successfully', 201);
  }),

  adminToggle: asyncHandler(async (req: Request, res: Response) => {
    const updated = await giftCardService.toggleActive(req.params.id);
    return sendSuccess(res, updated, 'Gift card status updated');
  }),

  adminDelete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await giftCardService.remove(req.params.id);
    return sendSuccess(res, deleted, 'Gift card deleted successfully');
  }),
};
