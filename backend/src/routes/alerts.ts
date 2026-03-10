import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { setAlert, deleteAlert } from '../controllers/alertController';

const router = Router();

router.use(apiLimiter);

router.post('/', authenticate, setAlert);
router.delete('/:productId', authenticate, deleteAlert);

export default router;
