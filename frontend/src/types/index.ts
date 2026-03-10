export interface Product {
  _id: string;
  productId: string;
  platform: 'amazon' | 'flipkart';
  title: string;
  image: string;
  url: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  lastScraped: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricePoint {
  price: number;
  timestamp: string;
}

export interface TrackedProduct {
  _id: string;
  userId: string;
  productId: Product;
  alertPrice: number | null;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
}
