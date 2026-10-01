import { Router } from 'express';
import { productController } from '@/controllers/product.controller';
import { reviewController } from '@/controllers/review.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { listProductsSchema } from '@/validators/product.validators';
import { createReviewSchema } from '@/validators/review.validators';

// Public & customer product routes with reviews.
const router = Router();

router.get('/', validate(listProductsSchema), productController.list);
router.get('/:idOrSlug', productController.detail);
router.get('/:idOrSlug/related', productController.related);

// Real-time Reviews & Ratings endpoints
router.get('/:idOrSlug/reviews', reviewController.list);
router.post('/:idOrSlug/reviews', authenticate, validate(createReviewSchema), reviewController.create);
router.post('/reviews/:id/helpful', reviewController.markHelpful);

export default router;
