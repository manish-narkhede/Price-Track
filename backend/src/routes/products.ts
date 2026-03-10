import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter, trackProductLimiter } from '../middleware/rateLimiter';
import {
  trackProduct,
  getProduct,
  getPriceHistory,
  getTrackedProducts,
  untrackProduct,
} from '../controllers/productController';

const router = Router();

router.use(apiLimiter);

router.post('/track', authenticate, trackProductLimiter, trackProduct);
router.get('/tracked', authenticate, getTrackedProducts);
router.delete('/tracked/:productId', authenticate, untrackProduct);
router.get('/:id', authenticate, getProduct);
router.get('/:id/history', authenticate, getPriceHistory);

export default router;
