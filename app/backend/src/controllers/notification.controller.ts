import type { Request, Response } from 'express';
import { notificationService } from '@/services/notification.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, unread, meta } = await notificationService.listForUser(
      req.user!.id,
      req.user!.role,
      req.query,
    );
    return sendSuccess(res, { items, unread }, 'Notifications fetched', 200, meta);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markRead(req.user!.id, req.user!.role, req.params.id);
    return sendSuccess(res, null, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id, req.user!.role);
    return sendSuccess(res, null, 'All notifications marked as read');
  }),
};
