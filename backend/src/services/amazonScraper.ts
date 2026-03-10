import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedProduct } from './scraper';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/[₹,\s\u20B9]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function scrapeAmazon(url: string): Promise<ScrapedProduct | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Title
    const title =
      $('#productTitle').text().trim() ||
      $('h1.a-size-large').first().text().trim() ||
      '';

    // Price — try multiple selectors in order of reliability
    const priceSelectors = [
      '.priceToPay .a-offscreen',
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#price_inside_buybox',
      '.a-price-whole',
    ];

    let priceText = '';
    for (const selector of priceSelectors) {
      const text = $(selector).first().text().trim();
      if (text && (text.includes('₹') || text.includes('.'))) {
        priceText = text;
        break;
      }
    }

    const price = parsePrice(priceText);

    // Image
    const image =
      $('#landingImage').attr('src') ||
      $('#imgBlkFront').attr('src') ||
      $('#main-image').attr('src') ||
      $('img#imgBlkFront').attr('src') ||
      '';

    if (!title || price === 0) {
      console.warn('[AmazonScraper] Could not extract title or price', { url });
      return null;
    }

    return { title, price, image };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[AmazonScraper] Axios error:', error.message, 'Status:', error.response?.status);
    } else {
      console.error('[AmazonScraper] Error:', error);
    }
    return null;
  }
}
