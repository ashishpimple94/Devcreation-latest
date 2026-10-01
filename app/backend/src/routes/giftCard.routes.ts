import { Router } from 'express';
import { giftCardController } from '@/controllers/giftCard.controller';

const router = Router();

// Public route to validate gift cards / redeem codes
router.post('/validate', giftCardController.validate);
// Public route to see available promo codes
router.get('/available', giftCardController.listAvailable);

export default router;
