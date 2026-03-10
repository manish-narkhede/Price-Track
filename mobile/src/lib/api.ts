import axios from "axios";
import {auth} from "./firebase";

const BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL!;

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return {Authorization: `Bearer ${token}`};
}

export async function trackProduct(url: string, targetPrice?: number) {
  const headers = await getAuthHeader();
  const {data} = await axios.post(`${BASE_URL}/trackProduct`, {url, targetPrice}, {headers});
  return data;
}

export async function getProduct(productId: string) {
  const headers = await getAuthHeader();
  const {data} = await axios.get(`${BASE_URL}/getProduct`, {
    headers,
    params: {productId},
  });
  return data;
}

export async function getPriceHistory(productId: string, range: number | "all" = 30) {
  const headers = await getAuthHeader();
  const {data} = await axios.get(`${BASE_URL}/getPriceHistory`, {
    headers,
    params: {productId, range},
  });
  return data.history as {price: number; timestamp: string}[];
}

export async function getTrackedProducts() {
  const headers = await getAuthHeader();
  const {data} = await axios.get(`${BASE_URL}/getTrackedProducts`, {headers});
  return data.products;
}

export async function removeTrackedProduct(productId: string) {
  const headers = await getAuthHeader();
  await axios.delete(`${BASE_URL}/removeTrackedProduct`, {headers, data: {productId}});
}

export async function updateFcmToken(fcmToken: string) {
  const headers = await getAuthHeader();
  await axios.post(`${BASE_URL}/updateFcmToken`, {fcmToken}, {headers});
}
