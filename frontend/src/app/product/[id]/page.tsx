'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getProduct, getPriceHistory } from '@/lib/api';
import type { Product, PricePoint, TrackedProduct } from '@/types';
import PriceChart from '@/components/PriceChart';
import AlertForm from '@/components/AlertForm';
import TrackButton from '@/components/TrackButton';

const RANGE_OPTIONS = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [tracking, setTracking] = useState<TrackedProduct | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) {
      loadProduct();
      loadHistory(days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id);
      setProduct(data.product);
      setTracking(data.tracking);
    } catch {
      setError('Product not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = useCallback(
    async (d: number) => {
      try {
        setHistoryLoading(true);
        const data = await getPriceHistory(id, d);
        setHistory(data.history);
      } catch {
        // silently fail
      } finally {
        setHistoryLoading(false);
      }
    },
    [id]
  );

  const handleRangeChange = (d: number) => {
    setDays(d);
    loadHistory(d);
  };

  const priceChange =
    history.length >= 2
      ? history[history.length - 1].price - history[history.length - 2].price
      : 0;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">{error || 'Product not found.'}</p>
        <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: product details */}
        <div className="lg:col-span-1 space-y-5">
          {/* Product card */}
          <div className="card">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <Minus size={40} />
                </div>
              )}
            </div>

            <span
              className={product.platform === 'amazon' ? 'badge-amazon' : 'badge-flipkart'}
            >
              {product.platform === 'amazon' ? 'Amazon' : 'Flipkart'}
            </span>

            <h1 className="font-semibold text-gray-900 text-lg mt-2 leading-snug line-clamp-3">
              {product.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.currentPrice)}
              </span>
              {priceChange !== 0 && (
                <span
                  className={`flex items-center text-sm font-medium ${
                    priceChange < 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {priceChange < 0 ? (
                    <TrendingDown size={14} className="mr-0.5" />
                  ) : (
                    <TrendingUp size={14} className="mr-0.5" />
                  )}
                  {formatPrice(Math.abs(priceChange))}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <RefreshCw size={11} /> Updated {formatDate(product.lastScraped)}
            </p>

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              View on {product.platform === 'amazon' ? 'Amazon' : 'Flipkart'}
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Price stats */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Price Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Current Price</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(product.currentPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Lowest Price</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(product.lowestPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Highest Price</span>
                <span className="font-semibold text-red-500">
                  {formatPrice(product.highestPrice)}
                </span>
              </div>
              {product.currentPrice === product.lowestPrice && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg text-center">
                  <span className="text-green-700 text-xs font-medium">
                    🎉 Currently at all-time low!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Track & Alert */}
          <div className="card space-y-3">
            <TrackButton
              productId={product._id}
              isTracked={!!tracking}
              onTrackChange={(tracked) => {
                if (!tracked) setTracking(null);
              }}
            />
            {tracking && (
              <AlertForm
                productId={product._id}
                currentPrice={product.currentPrice}
                existingAlertPrice={tracking.alertPrice}
                alertEnabled={tracking.alertEnabled}
                onAlertChange={(price, enabled) => {
                  setTracking((prev) =>
                    prev ? { ...prev, alertPrice: price, alertEnabled: enabled } : prev
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Right column: price chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-semibold text-gray-800">Price History</h2>
              <div className="flex gap-1.5 bg-gray-100 rounded-lg p-1">
                {RANGE_OPTIONS.map(({ label, days: d }) => (
                  <button
                    key={d}
                    onClick={() => handleRangeChange(d)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      days === d
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : history.length < 2 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Not enough data yet. Check back after the next price update.
              </div>
            ) : (
              <PriceChart data={history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
