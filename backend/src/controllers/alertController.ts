import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import TrackedProduct from '../models/TrackedProduct';

export async function setAlert(req: AuthRequest, res: Response): Promise<void> {
  const { productId, alertPrice } = req.body;

  if (!productId || typeof alertPrice !== 'number' || alertPrice <= 0) {
    res.status(400).json({ error: 'Valid productId and a positive alertPrice are required' });
    return;
  }

  try {
    const tracked = await TrackedProduct.findOneAndUpdate(
      { userId: req.user!.uid, productId },
      { alertPrice, alertEnabled: true },
      { new: true }
    );

    if (!tracked) {
      res.status(404).json({ error: 'Product not in your tracking list. Track it first.' });
      return;
    }

    res.json({ message: 'Alert set successfully', tracked });
  } catch (error) {
    console.error('[alertController] setAlert error:', error);
    res.status(500).json({ error: 'Failed to set alert' });
  }
}

export async function deleteAlert(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tracked = await TrackedProduct.findOneAndUpdate(
      { userId: req.user!.uid, productId: req.params.productId },
      { alertPrice: null, alertEnabled: false },
      { new: true }
    );

    if (!tracked) {
      res.status(404).json({ error: 'Product not found in your tracking list' });
      return;
    }

    res.json({ message: 'Alert removed successfully' });
  } catch (error) {
    console.error('[alertController] deleteAlert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
}
