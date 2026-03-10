import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import {db} from "./admin";
import {scrapeProduct, detectPlatform, extractAsin, extractFlipkartId} from "./scraper";
import {recordPrice, sendPriceDropNotification, getLowestPrice} from "./priceService";
import {Product} from "./types";

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// ─── Middleware: Verify Firebase auth token ───────────────────────────────────
async function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({error: "Unauthorized"});
    return;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    res.locals.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({error: "Invalid token"});
  }
}

// ─── POST /trackProduct ───────────────────────────────────────────────────────
// Body: { url: string, targetPrice?: number }
app.post("/trackProduct", authenticate, async (req, res) => {
  const {url, targetPrice} = req.body as {url?: string; targetPrice?: number};
  const uid: string = res.locals.uid;

  if (!url || typeof url !== "string") {
    res.status(400).json({error: "url is required"});
    return;
  }

  // Sanitise URL — must start with http/https
  if (!/^https?:\/\//i.test(url)) {
    res.status(400).json({error: "Invalid URL format"});
    return;
  }

  const platform = detectPlatform(url);
  if (!platform) {
    res.status(400).json({error: "Unsupported platform"});
    return;
  }

  try {
    // Determine canonical product identifier
    const productIdentifier = platform === "amazon"
      ? extractAsin(url)
      : extractFlipkartId(url);

    if (!productIdentifier) {
      res.status(400).json({error: "Could not extract product identifier from URL"});
      return;
    }

    // Check if product already exists in Firestore
    const existing = await db.collection("products")
      .where("productIdentifier", "==", productIdentifier)
      .where("platform", "==", platform)
      .limit(1)
      .get();

    let productId: string;
    let product: Product;

    if (!existing.empty) {
      productId = existing.docs[0].id;
      product = existing.docs[0].data() as Product;
    } else {
      // Scrape product info
      const scraped = await scrapeProduct(url);
      const ref = db.collection("products").doc();
      product = {
        productId: ref.id,
        title: scraped.title,
        image: scraped.image,
        platform: scraped.platform,
        productIdentifier: scraped.productIdentifier,
        url,
        currentPrice: scraped.price,
        createdAt: admin.firestore.Timestamp.now(),
      };
      await ref.set(product);
      await recordPrice(ref.id, scraped.price);
      productId = ref.id;
    }

    // Check if user is already tracking this product
    const alreadyTracked = await db.collection("trackedProducts")
      .where("uid", "==", uid)
      .where("productId", "==", productId)
      .limit(1)
      .get();

    if (alreadyTracked.empty) {
      await db.collection("trackedProducts").add({
        uid,
        productId,
        targetPrice: targetPrice ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({success: true, productId, product});
  } catch (err) {
    functions.logger.error("trackProduct error", err);
    res.status(500).json({error: "Failed to track product"});
  }
});

// ─── GET /getProduct?productId=xxx ───────────────────────────────────────────
app.get("/getProduct", authenticate, async (req, res) => {
  const {productId} = req.query as {productId?: string};
  if (!productId) {
    res.status(400).json({error: "productId is required"});
    return;
  }

  try {
    const doc = await db.collection("products").doc(productId).get();
    if (!doc.exists) {
      res.status(404).json({error: "Product not found"});
      return;
    }

    const lowestPrice = await getLowestPrice(productId);
    const highestSnap = await db.collection("priceHistory")
      .where("productId", "==", productId)
      .orderBy("price", "desc")
      .limit(1)
      .get();
    const highestPrice = highestSnap.empty ? null : highestSnap.docs[0].data().price;

    res.json({product: doc.data(), lowestPrice, highestPrice});
  } catch (err) {
    functions.logger.error("getProduct error", err);
    res.status(500).json({error: "Failed to fetch product"});
  }
});

// ─── GET /getPriceHistory?productId=xxx&range=30 ─────────────────────────────
app.get("/getPriceHistory", authenticate, async (req, res) => {
  const {productId, range} = req.query as {productId?: string; range?: string};
  if (!productId) {
    res.status(400).json({error: "productId is required"});
    return;
  }

  const days = parseInt(range ?? "30", 10);
  const validRanges = [7, 30, 90];
  const cutoff = validRanges.includes(days)
    ? admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      )
    : null; // null = all time

  try {
    let query: FirebaseFirestore.Query = db.collection("priceHistory")
      .where("productId", "==", productId)
      .orderBy("timestamp", "asc");

    if (cutoff) query = query.where("timestamp", ">=", cutoff);

    const snap = await query.get();
    const history = snap.docs.map((d) => ({
      price: d.data().price,
      timestamp: (d.data().timestamp as admin.firestore.Timestamp).toDate().toISOString(),
    }));

    res.json({history});
  } catch (err) {
    functions.logger.error("getPriceHistory error", err);
    res.status(500).json({error: "Failed to fetch price history"});
  }
});

// ─── GET /getTrackedProducts ──────────────────────────────────────────────────
app.get("/getTrackedProducts", authenticate, async (req, res) => {
  const uid: string = res.locals.uid;
  try {
    const snap = await db.collection("trackedProducts")
      .where("uid", "==", uid)
      .get();

    const productIds = snap.docs.map((d) => d.data().productId as string);
    if (productIds.length === 0) {
      res.json({products: []});
      return;
    }

    // Fetch product details in batch (Firestore in() supports up to 30 items)
    const chunks: string[][] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      chunks.push(productIds.slice(i, i + 30));
    }

    const products = [];
    for (const chunk of chunks) {
      const productSnap = await db.collection("products")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      products.push(...productSnap.docs.map((d) => d.data()));
    }

    res.json({products});
  } catch (err) {
    functions.logger.error("getTrackedProducts error", err);
    res.status(500).json({error: "Failed to fetch tracked products"});
  }
});

// ─── DELETE /removeTrackedProduct ─────────────────────────────────────────────
// Body: { productId: string }
app.delete("/removeTrackedProduct", authenticate, async (req, res) => {
  const {productId} = req.body as {productId?: string};
  const uid: string = res.locals.uid;

  if (!productId) {
    res.status(400).json({error: "productId is required"});
    return;
  }

  try {
    const snap = await db.collection("trackedProducts")
      .where("uid", "==", uid)
      .where("productId", "==", productId)
      .limit(1)
      .get();

    if (snap.empty) {
      res.status(404).json({error: "Tracked product not found"});
      return;
    }

    await snap.docs[0].ref.delete();
    res.json({success: true});
  } catch (err) {
    functions.logger.error("removeTrackedProduct error", err);
    res.status(500).json({error: "Failed to remove tracked product"});
  }
});

// ─── POST /updateFcmToken ─────────────────────────────────────────────────────
// Body: { fcmToken: string }
app.post("/updateFcmToken", authenticate, async (req, res) => {
  const {fcmToken} = req.body as {fcmToken?: string};
  const uid: string = res.locals.uid;

  if (!fcmToken || typeof fcmToken !== "string") {
    res.status(400).json({error: "fcmToken is required"});
    return;
  }

  try {
    await db.collection("users").doc(uid).set(
      {fcmToken, updatedAt: admin.firestore.FieldValue.serverTimestamp()},
      {merge: true}
    );
    res.json({success: true});
  } catch (err) {
    functions.logger.error("updateFcmToken error", err);
    res.status(500).json({error: "Failed to update FCM token"});
  }
});

export const api = functions.https.onRequest(app);

// ─── Scheduled: Refresh all tracked product prices every 6 hours ─────────────
export const refreshPrices = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    functions.logger.info("Starting scheduled price refresh");

    const productsSnap = await db.collection("products").get();

    const tasks = productsSnap.docs.map(async (doc) => {
      const product = doc.data() as Product;
      try {
        const {scrapeProduct: scrape} = await import("./scraper");
        const scraped = await scrape(product.url);
        const newPrice = scraped.price;
        const prevPrice = product.currentPrice;

        await recordPrice(product.productId, newPrice);
        await db.collection("products").doc(product.productId).update({
          currentPrice: newPrice,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // If price dropped, notify all users tracking this product
        if (newPrice < prevPrice) {
          const trackers = await db.collection("trackedProducts")
            .where("productId", "==", product.productId)
            .get();

          const notifyTasks = trackers.docs.map(async (tracker) => {
            const {uid, targetPrice} = tracker.data();
            // Notify if no target set, or new price hit/beat target
            if (!targetPrice || newPrice <= targetPrice) {
              await sendPriceDropNotification(uid, product, newPrice);
            }
          });
          await Promise.allSettled(notifyTasks);
        }
      } catch (err) {
        functions.logger.warn(`Failed to refresh price for ${product.productId}`, err);
      }
    });

    await Promise.allSettled(tasks);
    functions.logger.info("Scheduled price refresh complete");
    return null;
  });

// ─── Auth trigger: create user document on signup ─────────────────────────────
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email ?? "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
