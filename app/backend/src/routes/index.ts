import { Router } from 'express';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import productRoutes from '@/routes/product.routes';
import categoryRoutes from '@/routes/category.routes';
import cartRoutes from '@/routes/cart.routes';
import orderRoutes from '@/routes/order.routes';
import notificationRoutes from '@/routes/notification.routes';
import adminRoutes from '@/routes/admin.routes';
import giftCardRoutes from '@/routes/giftCard.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/gift-cards', giftCardRoutes);

export default router;
