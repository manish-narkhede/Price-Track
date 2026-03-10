"use client";
export const dynamic = "force-dynamic";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {getProduct, getPriceHistory, trackProduct} from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
import Image from "next/image";
import PriceChart from "@/components/PriceChart";
import Link from "next/link";

type Range = 7 | 30 | 90 | "all";

interface ProductDetails {
  productId: string;
  title: string;
  image: string;
  platform: string;
  currentPrice: number;
  url: string;
}

interface PricePoint {
  price: number;
  timestamp: string;
}

export default function ProductPage() {
  const {productId} = useParams() as {productId: string};
  const {user} = useAuth();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [highestPrice, setHighestPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [range, setRange] = useState<Range>(30);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      getProduct(productId),
      getPriceHistory(productId, range),
    ])
      .then(([productData, hist]) => {
        setProduct(productData.product);
        setLowestPrice(productData.lowestPrice);
        setHighestPrice(productData.highestPrice);
        setHistory(hist);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId, range]);

  async function handleTrack() {
    if (!user) return;
    try {
      await trackProduct(product!.url);
      setTracked(true);
    } catch {
      setError("Failed to track product");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 text-lg">Loading product…</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error || "Product not found"}
      </div>
    );
  }

  const ranges: Range[] = [7, 30, 90, "all"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
          {product.image && (
            <Image src={product.image} alt={product.title} fill className="object-contain p-3" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {product.platform}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{product.title}</h1>
          </div>

          <div className="flex flex-wrap gap-6 mt-4">
            <Stat label="Current Price" value={`₹${product.currentPrice?.toLocaleString("en-IN")}`} highlight />
            {lowestPrice !== null && (
              <Stat label="Lowest Ever" value={`₹${lowestPrice.toLocaleString("en-IN")}`} green />
            )}
            {highestPrice !== null && (
              <Stat label="Highest Ever" value={`₹${highestPrice.toLocaleString("en-IN")}`} />
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Buy Now
            </a>
            {user && !tracked && (
              <button
                onClick={handleTrack}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Track Price
              </button>
            )}
            {tracked && (
              <Link
                href="/dashboard"
                className="border border-green-600 text-green-600 px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                ✓ Tracked
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Price History</h2>
          <div className="flex gap-2">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                  range === r
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r === "all" ? "All Time" : `${r}d`}
              </button>
            ))}
          </div>
        </div>
        <PriceChart history={history} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  green,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-blue-700" : green ? "text-green-600" : "text-gray-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
