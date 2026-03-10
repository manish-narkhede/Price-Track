import axios from "axios";
import * as cheerio from "cheerio";
import {ScrapeResult} from "./types";

// Rotate user agents to reduce bot detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Detects the platform from a URL.
 */
export function detectPlatform(url: string): "amazon" | "flipkart" | null {
  if (/amazon\.(in|com)/i.test(url)) return "amazon";
  if (/flipkart\.com/i.test(url)) return "flipkart";
  return null;
}

/**
 * Extracts Amazon ASIN from product URL.
 */
export function extractAsin(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i) ||
                url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
                url.match(/asin=([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Extracts Flipkart product ID from product URL.
 */
export function extractFlipkartId(url: string): string | null {
  const match = url.match(/pid=([A-Z0-9]+)/i) ||
                url.match(/\/p\/([A-Za-z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Scrapes Amazon product page.
 */
async function scrapeAmazon(url: string): Promise<ScrapeResult> {
  const asin = extractAsin(url);
  if (!asin) throw new Error("Could not extract ASIN from URL");

  const canonicalUrl = `https://www.amazon.in/dp/${asin}`;

  const {data} = await axios.get(canonicalUrl, {
    headers: {
      "User-Agent": randomUserAgent(),
      "Accept-Language": "en-IN,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(data);

  const title = $("#productTitle").text().trim() ||
    $("span#productTitle").text().trim();

  if (!title) throw new Error("Could not extract product title from Amazon page");

  const image = $("#landingImage").attr("src") ||
    $("#imgBlkFront").attr("src") ||
    $(".a-dynamic-image").first().attr("src") || "";

  // Amazon price selectors
  const priceText =
    $(".a-price .a-offscreen").first().text().trim() ||
    $("#priceblock_ourprice").text().trim() ||
    $("#priceblock_dealprice").text().trim() ||
    $(".a-price-whole").first().text().trim();

  const price = parsePrice(priceText);
  if (!price) throw new Error("Could not extract price from Amazon page");

  return {title, image, price, platform: "amazon", productIdentifier: asin};
}

/**
 * Scrapes Flipkart product page.
 */
async function scrapeFlipkart(url: string): Promise<ScrapeResult> {
  const productId = extractFlipkartId(url);
  if (!productId) throw new Error("Could not extract product ID from Flipkart URL");

  const {data} = await axios.get(url, {
    headers: {
      "User-Agent": randomUserAgent(),
      "Accept-Language": "en-IN,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 10000,
  });

  const $ = cheerio.load(data);

  const title =
    $("span.B_NuCI").text().trim() ||
    $("h1.yhB1nd").text().trim() ||
    $("[class*='title']").first().text().trim();

  if (!title) throw new Error("Could not extract product title from Flipkart page");

  const image =
    $("img._396cs4").attr("src") ||
    $("img._2r_T1I").attr("src") ||
    $("img[class*='product']").first().attr("src") || "";

  const priceText =
    $("div._30jeq3._16Jk6d").text().trim() ||
    $("div._30jeq3").text().trim() ||
    $("[class*='price']").first().text().trim();

  const price = parsePrice(priceText);
  if (!price) throw new Error("Could not extract price from Flipkart page");

  return {title, image, price, platform: "flipkart", productIdentifier: productId};
}

/**
 * Parse a price string (e.g. "₹1,499", "$14.99") to a number.
 */
function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[₹$,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Main scraper — detects platform and dispatches.
 */
export async function scrapeProduct(url: string): Promise<ScrapeResult> {
  const platform = detectPlatform(url);
  if (!platform) throw new Error("Unsupported platform. Only Amazon and Flipkart URLs are supported.");

  if (platform === "amazon") return scrapeAmazon(url);
  return scrapeFlipkart(url);
}
