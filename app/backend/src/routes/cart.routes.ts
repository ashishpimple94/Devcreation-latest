import { Router } from 'express';
import { cartController } from '@/controllers/cart.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { addItemSchema, updateItemSchema } from '@/validators/cart.validators';

// All cart routes require an authenticated customer.
const router = Router();
router.use(authenticate);

router.get('/', cartController.get);
router.post('/items', validate(addItemSchema), cartController.add);
router.patch('/items', validate(updateItemSchema), cartController.update);
router.delete('/items/:productId', cartController.remove);
router.delete('/', cartController.clear);

export default router;
