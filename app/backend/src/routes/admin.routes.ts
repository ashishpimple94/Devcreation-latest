import { Router } from 'express';
import { adminController } from '@/controllers/admin.controller';
import { productController } from '@/controllers/product.controller';
import { orderController } from '@/controllers/order.controller';
import { uploadController } from '@/controllers/upload.controller';
import { giftCardController } from '@/controllers/giftCard.controller';
import { authenticate, authorize, authorizeStaff } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { uploadImages } from '@/middleware/upload';
import { ROLES } from '@/constants';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
} from '@/validators/product.validators';
import { updateOrderStatusSchema } from '@/validators/order.validators';

/**
 * Admin API. Every route requires authentication + a staff role. Finer-grained
 * role rules are applied per-section:
 *   - Managers: products, orders, inventory
 *   - Admins: + customers, dashboard
 *   - Super admin: + role management
 */
const router = Router();
router.use(authenticate, authorizeStaff);

// Dashboard — admin & super admin
router.get('/dashboard', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.dashboard);

// Product management — all staff
router.get('/products', validate(listProductsSchema), productController.list);
router.get('/products/:idOrSlug', productController.detail);
router.post('/products', validate(createProductSchema), productController.create);
router.patch('/products/:id', validate(updateProductSchema), productController.update);
router.delete('/products/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), productController.remove);
router.post('/uploads', uploadImages.array('images', 8), uploadController.images);

// Categories — admin & super admin
router.get('/categories', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.listCategories);
router.post('/categories', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.createCategory);
router.patch('/categories/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.updateCategory);
router.delete('/categories/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.removeCategory);

// Order management — all staff
router.get('/orders', orderController.adminList);
router.get('/orders/:id', orderController.adminGet);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), orderController.adminUpdateStatus);

// Customer management — admin & super admin
router.get('/customers', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.listCustomers);
router.get('/customers/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.getCustomer);
router.patch('/customers/:id/active', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), adminController.setCustomerActive);

// Gift Cards & Promo Codes — admin & super admin
router.get('/gift-cards', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminList);
router.post('/gift-cards', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminCreate);
router.patch('/gift-cards/:id/toggle', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminToggle);
router.delete('/gift-cards/:id', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), giftCardController.adminDelete);

// Role management — super admin only
router.patch('/users/:id/role', authorize(ROLES.SUPER_ADMIN), adminController.updateUserRole);

export default router;
