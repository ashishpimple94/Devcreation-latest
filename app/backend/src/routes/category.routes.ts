import { Router } from 'express';
import { categoryController } from '@/controllers/category.controller';

// Public, read-only category routes.
const router = Router();
router.get('/', categoryController.listActive);
export default router;
