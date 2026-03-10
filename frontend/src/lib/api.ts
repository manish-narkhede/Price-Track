import axios from 'axios';
import { auth } from './firebase';
import type { Product, PricePoint, TrackedProduct } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Attach Firebase ID token on every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Products ──────────────────────────────────────────────

export async function trackProduct(url: string): Promise<{ product: Product }> {
  const res = await api.post('/products/track', { url });
  return res.data;
}

export async function getProduct(
  id: string
): Promise<{ product: Product; tracking: TrackedProduct | null }> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getPriceHistory(
  id: string,
  days = 90
): Promise<{ history: PricePoint[] }> {
  const res = await api.get(`/products/${id}/history`, { params: { days } });
  return res.data;
}

export async function getTrackedProducts(): Promise<{ products: TrackedProduct[] }> {
  const res = await api.get('/products/tracked');
  return res.data;
}

export async function untrackProduct(productId: string): Promise<{ message: string }> {
  const res = await api.delete(`/products/tracked/${productId}`);
  return res.data;
}

// ── Alerts ────────────────────────────────────────────────

export async function setAlert(
  productId: string,
  alertPrice: number
): Promise<{ message: string }> {
  const res = await api.post('/alerts', { productId, alertPrice });
  return res.data;
}

export async function deleteAlert(productId: string): Promise<{ message: string }> {
  const res = await api.delete(`/alerts/${productId}`);
  return res.data;
}

export default api;
