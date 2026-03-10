"use client";
export const dynamic = "force-dynamic";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {trackProduct} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";

export default function HomePage() {
  const {user, loading} = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) {
      router.push("/auth");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a product URL.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await trackProduct(url.trim());
      router.push(`/product/${result.productId}`);
    } catch {
      setError("Failed to fetch product. Please check the URL and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Track Any Product Price
      </h1>
      <p className="text-lg text-gray-500 mb-10 text-center max-w-md">
        Paste an Amazon or Flipkart product URL to view its price history and get
        drop alerts.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.amazon.in/dp/B0... or Flipkart URL"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || submitting}
        />
        <button
          type="submit"
          disabled={loading || submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          {submitting ? "Loading…" : "Track Price"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full text-center">
        {[
          {icon: "📈", title: "Price History", desc: "View historical price charts over 7, 30, 90 days or all time."},
          {icon: "🔔", title: "Drop Alerts", desc: "Get notified instantly when a price falls below your target."},
          {icon: "🛒", title: "Best Time to Buy", desc: "See lowest ever price and decide when to purchase."},
        ].map(({icon, title, desc}) => (
          <div key={title} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
