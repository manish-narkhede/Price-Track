import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import PriceHistory from '../models/PriceHistory';
import TrackedProduct from '../models/TrackedProduct';
import { scrapeProduct, detectPlatform, extractProductId } from '../services/scraper';

export async function trackProduct(req: AuthRequest, res: Response): Promise<void> {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Product URL is required' });
    return;
  }

  const trimmedUrl = url.trim();

  // Validate URL format
  try {
    new URL(trimmedUrl);
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const platform = detectPlatform(trimmedUrl);
  if (!platform) {
    res.status(400).json({ error: 'Only Amazon (amazon.in) and Flipkart URLs are supported' });
    return;
  }

  const productId = extractProductId(trimmedUrl, platform);
  if (!productId) {
    res.status(400).json({ error: 'Could not extract product ID from URL' });
    return;
  }

  try {
    // Reuse existing product record if available
    let product = await Product.findOne({ productId, platform });

    if (!product) {
      const scraped = await scrapeProduct(trimmedUrl, platform);
      if (!scraped) {
        res.status(422).json({
          error: 'Failed to fetch product data. The product page may be unavailable.',
        });
        return;
      }

      product = await Product.create({
        productId,
        platform,
        title: scraped.title,
        image: scraped.image,
        url: trimmedUrl,
        currentPrice: scraped.price,
        lowestPrice: scraped.price,
        highestPrice: scraped.price,
        lastScraped: new Date(),
      });

      await PriceHistory.create({
        productId: product._id,
        price: scraped.price,
        timestamp: new Date(),
      });
    }

    // Add to user's tracked list (idempotent)
    await TrackedProduct.findOneAndUpdate(
      { userId: req.user!.uid, productId: product._id },
      { userId: req.user!.uid, productId: product._id },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Product tracked successfully', product });
  } catch (error) {
    console.error('[productController] trackProduct error:', error);
    res.status(500).json({ error: 'Failed to track product' });
  }
}

export async function getProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const tracking = await TrackedProduct.findOne({
      userId: req.user!.uid,
      productId: product._id,
    });

    res.json({ product, tracking });
  } catch (error) {
    console.error('[productController] getProduct error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

export async function getPriceHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const daysParam = req.query.days as string;
    const days = Math.min(Math.max(parseInt(daysParam || '90', 10), 1), 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await PriceHistory.find({
      productId: req.params.id,
      timestamp: { $gte: since },
    })
      .sort({ timestamp: 1 })
      .select('price timestamp -_id')
      .lean();

    res.json({ history });
  } catch (error) {
    console.error('[productController] getPriceHistory error:', error);
    res.status(500).json({ error: 'Failed to get price history' });
  }
}

export async function getTrackedProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const tracked = await TrackedProduct.find({ userId: req.user!.uid })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ products: tracked });
  } catch (error) {
    console.error('[productController] getTrackedProducts error:', error);
    res.status(500).json({ error: 'Failed to get tracked products' });
  }
}

export async function untrackProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    await TrackedProduct.findOneAndDelete({
      userId: req.user!.uid,
      productId: req.params.productId,
    });

    res.json({ message: 'Product removed from tracking' });
  } catch (error) {
    console.error('[productController] untrackProduct error:', error);
    res.status(500).json({ error: 'Failed to untrack product' });
  }
}
