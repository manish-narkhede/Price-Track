import { scrapeAmazon } from './amazonScraper';
import { scrapeFlipkart } from './flipkartScraper';
import { Platform } from '../models/Product';

export interface ScrapedProduct {
  title: string;
  price: number;
  image: string;
}

export function detectPlatform(url: string): Platform | null {
  if (/amazon\.(in|com)/.test(url)) return 'amazon';
  if (/flipkart\.com/.test(url)) return 'flipkart';
  return null;
}

export function extractProductId(url: string, platform: Platform): string | null {
  if (platform === 'amazon') {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    return match ? match[1] : null;
  }

  if (platform === 'flipkart') {
    // Path pattern: /product-name/p/ITEM_ID
    const pathMatch = url.match(/\/p\/([a-zA-Z0-9]+)/);
    if (pathMatch) return pathMatch[1];
    // Query param pattern: ?pid=ITEM_ID
    const pidMatch = url.match(/[?&]pid=([^&]+)/);
    if (pidMatch) return pidMatch[1];
  }

  return null;
}

export async function scrapeProduct(
  url: string,
  platform: Platform
): Promise<ScrapedProduct | null> {
  try {
    if (platform === 'amazon') return await scrapeAmazon(url);
    if (platform === 'flipkart') return await scrapeFlipkart(url);
    return null;
  } catch (error) {
    console.error(`[Scraper] Error scraping ${platform}:`, error);
    return null;
  }
}
