import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from '@/validators/user.validators';

const router = Router();
router.use(authenticate);

// Profile
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/me/change-password', validate(changePasswordSchema), userController.changePassword);

// Wishlist
router.get('/me/wishlist', userController.getWishlist);
router.post('/me/wishlist/:productId', userController.toggleWishlist);

// Addresses
router.get('/me/addresses', userController.listAddresses);
router.post('/me/addresses', validate(addressSchema), userController.addAddress);
router.patch('/me/addresses/:id', validate(addressSchema), userController.updateAddress);
router.delete('/me/addresses/:id', userController.removeAddress);

export default router;
