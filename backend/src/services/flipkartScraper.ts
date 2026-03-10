import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedProduct } from './scraper';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/[₹,\s\u20B9]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function scrapeFlipkart(url: string): Promise<ScrapedProduct | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Title — Flipkart class names change periodically; try several patterns
    const title =
      $('span.B_NuCI').text().trim() ||
      $('h1.yhB1nd').text().trim() ||
      $('h1._9E25nV').text().trim() ||
      $('h1[class*="yhB1nd"]').text().trim() ||
      $('div._35KyD6 h1').text().trim() ||
      '';

    // Price
    const priceSelectors = [
      '._30jeq3._16Jk6d',
      '._30jeq3',
      'div[class*="_30jeq3"]',
      '.CEmiEU ._30jeq3',
    ];

    let priceText = '';
    for (const selector of priceSelectors) {
      const text = $(selector).first().text().trim();
      if (text) {
        priceText = text;
        break;
      }
    }

    const price = parsePrice(priceText);

    // Image
    const image =
      $('img._396cs4').first().attr('src') ||
      $('img[class*="_396cs4"]').first().attr('src') ||
      $('img.q6DClP').first().attr('src') ||
      $('div._3kidJX img').first().attr('src') ||
      '';

    if (!title || price === 0) {
      console.warn('[FlipkartScraper] Could not extract title or price', { url });
      return null;
    }

    return { title, price, image };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[FlipkartScraper] Axios error:', error.message, 'Status:', error.response?.status);
    } else {
      console.error('[FlipkartScraper] Error:', error);
    }
    return null;
  }
}
