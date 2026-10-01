import { Router } from 'express';
import { orderController } from '@/controllers/order.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { checkoutSchema } from '@/validators/order.validators';

// Customer order routes. Admin order routes live under /admin/orders.
const router = Router();
router.use(authenticate);

router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get('/', orderController.listMine);
router.get('/:id', orderController.getMine);
router.post('/:id/cancel', orderController.cancelMine);

export default router;
