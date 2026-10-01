import { Router } from 'express';
import { productController } from '@/controllers/product.controller';
import { validate } from '@/middleware/validate';
import { listProductsSchema } from '@/validators/product.validators';

// Public, read-only product routes. Admin write routes live under /admin.
const router = Router();

router.get('/', validate(listProductsSchema), productController.list);
router.get('/:idOrSlug', productController.detail);
router.get('/:idOrSlug/related', productController.related);

export default router;
