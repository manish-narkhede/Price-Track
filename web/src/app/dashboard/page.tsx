"use client";
export const dynamic = "force-dynamic";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {getTrackedProducts, removeTrackedProduct} from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface Product {
  productId: string;
  title: string;
  image: string;
  platform: string;
  currentPrice: number;
  url: string;
}

export default function DashboardPage() {
  const {user, loading} = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    getTrackedProducts()
      .then(setProducts)
      .catch(() => setError("Failed to load tracked products"))
      .finally(() => setFetching(false));
  }, [user]);

  async function handleRemove(productId: string) {
    try {
      await removeTrackedProduct(productId);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch {
      setError("Failed to remove product");
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 text-lg">Loading…</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Track New
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">You haven&apos;t tracked any products yet.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Track your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.productId}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <Link href={`/product/${p.productId}`}>
                <div className="relative h-48 bg-gray-50">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-contain p-4"
                    />
                  )}
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs font-medium text-blue-600 uppercase mb-1">
                  {p.platform}
                </p>
                <Link href={`/product/${p.productId}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                    {p.title}
                  </h3>
                </Link>
                <p className="text-xl font-bold text-gray-900 mt-2">
                  ₹{p.currentPrice?.toLocaleString("en-IN")}
                </p>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/product/${p.productId}`}
                    className="flex-1 text-center text-sm py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleRemove(p.productId)}
                    className="flex-1 text-center text-sm py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Untrack
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
