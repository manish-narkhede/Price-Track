export interface Product {
  productId: string;
  title: string;
  image: string;
  platform: "amazon" | "flipkart";
  productIdentifier: string; // ASIN or Flipkart product ID
  url: string;
  currentPrice: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface PriceHistory {
  productId: string;
  price: number;
  timestamp: FirebaseFirestore.Timestamp;
}

export interface TrackedProduct {
  uid: string;
  productId: string;
  targetPrice?: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface User {
  uid: string;
  email: string;
  fcmToken?: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface ScrapeResult {
  title: string;
  image: string;
  price: number;
  platform: "amazon" | "flipkart";
  productIdentifier: string;
}
