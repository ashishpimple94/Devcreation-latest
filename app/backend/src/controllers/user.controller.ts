import type { Request, Response } from 'express';
import { userService } from '@/services/user.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

export const userController = {
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, user, 'Profile updated');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    return sendSuccess(res, result, 'Password changed');
  }),

  getWishlist: asyncHandler(async (req: Request, res: Response) => {
    const items = await userService.getWishlist(req.user!.id);
    return sendSuccess(res, items, 'Wishlist fetched');
  }),

  toggleWishlist: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.toggleWishlist(req.user!.id, req.params.productId);
    return sendSuccess(res, result, result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
  }),

  listAddresses: asyncHandler(async (req: Request, res: Response) => {
    const items = await userService.listAddresses(req.user!.id);
    return sendSuccess(res, items, 'Addresses fetched');
  }),

  addAddress: asyncHandler(async (req: Request, res: Response) => {
    const address = await userService.addAddress(req.user!.id, req.body);
    return sendSuccess(res, address, 'Address added', 201);
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const address = await userService.updateAddress(req.user!.id, req.params.id, req.body);
    return sendSuccess(res, address, 'Address updated');
  }),

  removeAddress: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.removeAddress(req.user!.id, req.params.id);
    return sendSuccess(res, result, 'Address removed');
  }),
};
