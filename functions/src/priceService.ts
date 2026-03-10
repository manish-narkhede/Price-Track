import {db, messaging} from "./admin";
import * as admin from "firebase-admin";
import {TrackedProduct, Product} from "./types";

/**
 * Saves a new price record to priceHistory collection.
 */
export async function recordPrice(productId: string, price: number): Promise<void> {
  await db.collection("priceHistory").add({
    productId,
    price,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Updates the currentPrice field on the product document.
 */
export async function updateProductPrice(productId: string, price: number): Promise<void> {
  await db.collection("products").doc(productId).update({
    currentPrice: price,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Returns all tracked entries for a given product.
 */
export async function getTrackersForProduct(productId: string): Promise<TrackedProduct[]> {
  const snap = await db.collection("trackedProducts")
    .where("productId", "==", productId)
    .get();
  return snap.docs.map((d) => d.data() as TrackedProduct);
}

/**
 * Sends an FCM push notification to a user about a price drop.
 */
export async function sendPriceDropNotification(
  uid: string,
  product: Product,
  newPrice: number
): Promise<void> {
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) return;

  const fcmToken: string | undefined = userSnap.data()?.fcmToken;
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title: "Price Drop Alert!",
      body: `${product.title.slice(0, 60)} is now ₹${newPrice}`,
    },
    data: {
      productId: product.productId,
      newPrice: String(newPrice),
    },
  };

  await messaging.send(message);
}

/**
 * Checks price history to find all-time lowest price for a product.
 */
export async function getLowestPrice(productId: string): Promise<number | null> {
  const snap = await db.collection("priceHistory")
    .where("productId", "==", productId)
    .orderBy("price", "asc")
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data().price as number;
}
