import cron from 'node-cron';
import Product from '../models/Product';
import PriceHistory from '../models/PriceHistory';
import TrackedProduct from '../models/TrackedProduct';
import User from '../models/User';
import { scrapeProduct } from './scraper';
import { sendPriceDropAlert } from './notificationService';
import { connectDatabase } from '../config/database';

export function startPriceTracker(): void {
  const intervalHours = Math.max(
    1,
    parseInt(process.env.SCRAPE_INTERVAL_HOURS || '6', 10)
  );
  const cronExpression = `0 */${intervalHours} * * *`;

  cron.schedule(cronExpression, async () => {
    console.log(`[PriceTracker] Starting scheduled update at ${new Date().toISOString()}`);
    await updateAllPrices();
  });

  console.log(`[PriceTracker] Scheduled every ${intervalHours} hour(s)`);
}

export async function updateAllPrices(): Promise<void> {
  const products = await Product.find({}).lean();
  console.log(`[PriceTracker] Updating ${products.length} products`);

  for (const product of products) {
    try {
      await updateProductPrice(
        product._id.toString(),
        product.url,
        product.platform
      );
      // Polite delay between scrape requests
      await delay(2000 + Math.random() * 3000);
    } catch (error) {
      console.error(`[PriceTracker] Failed to update product ${product._id}:`, error);
    }
  }

  console.log('[PriceTracker] Update cycle complete');
}

async function updateProductPrice(
  mongoId: string,
  url: string,
  platform: 'amazon' | 'flipkart'
): Promise<void> {
  const scraped = await scrapeProduct(url, platform);
  if (!scraped || scraped.price === 0) {
    console.warn(`[PriceTracker] Skipping product ${mongoId} — scrape returned no price`);
    return;
  }

  const product = await Product.findById(mongoId);
  if (!product) return;

  const oldPrice = product.currentPrice;
  const newPrice = scraped.price;

  product.currentPrice = newPrice;
  product.lowestPrice = Math.min(product.lowestPrice, newPrice);
  product.highestPrice = Math.max(product.highestPrice, newPrice);
  product.lastScraped = new Date();
  await product.save();

  await PriceHistory.create({
    productId: product._id,
    price: newPrice,
    timestamp: new Date(),
  });

  if (newPrice < oldPrice) {
    await checkAndSendAlerts(mongoId, newPrice, product.title);
  }
}

async function checkAndSendAlerts(
  mongoId: string,
  currentPrice: number,
  productTitle: string
): Promise<void> {
  const alerts = await TrackedProduct.find({
    productId: mongoId,
    alertEnabled: true,
    alertPrice: { $gte: currentPrice },
  });

  for (const alert of alerts) {
    try {
      const user = await User.findOne({ uid: alert.userId });
      if (user?.email) {
        await sendPriceDropAlert({
          email: user.email,
          productTitle,
          currentPrice,
          alertPrice: alert.alertPrice!,
        });
      }
    } catch (error) {
      console.error(`[PriceTracker] Failed to send alert to user ${alert.userId}:`, error);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Support running directly: `ts-node src/services/priceTracker.ts`
if (require.main === module) {
  connectDatabase()
    .then(() => updateAllPrices())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
