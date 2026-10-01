import type { Request, Response } from 'express';
import { orderService } from '@/services/order.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const orderController = {
  // ---- Customer ----
  checkout: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.checkout(req.user!.id, req.body);
    return sendSuccess(res, order, 'Order placed successfully', 201);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await orderService.listForUser(req.user!.id, req.query);
    return sendSuccess(res, items, 'Orders fetched', 200, meta);
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getForUser(req.user!.id, req.params.id);
    return sendSuccess(res, order, 'Order fetched');
  }),

  cancelMine: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.cancelByUser(req.user!.id, req.params.id);
    return sendSuccess(res, order, 'Order cancelled');
  }),

  // ---- Admin ----
  adminList: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await orderService.adminList(req.query);
    return sendSuccess(res, items, 'Orders fetched', 200, meta);
  }),

  adminGet: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.adminGet(req.params.id);
    return sendSuccess(res, order, 'Order fetched');
  }),

  adminUpdateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.changeStatus(
      req.params.id,
      req.body.status,
      req.user!.id,
      req.body.note,
    );
    return sendSuccess(res, order, 'Order status updated');
  }),
};
