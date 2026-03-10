'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, PackageSearch, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getTrackedProducts, trackProduct } from '@/lib/api';
import type { TrackedProduct } from '@/types';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackSuccess, setTrackSuccess] = useState('');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getTrackedProducts();
      setProducts(data.products);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadProducts();
  }, [user, loadProducts]);

  // Auto-track if redirected from landing page with ?track=URL
  useEffect(() => {
    const urlToTrack = searchParams.get('track');
    if (urlToTrack && user) {
      handleTrack(urlToTrack);
      // Clean the query param
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTrack = async (url: string) => {
    setTrackError('');
    setTrackSuccess('');
    setTracking(true);
    try {
      const res = await trackProduct(url);
      setTrackSuccess(`"${res.product.title}" is now being tracked!`);
      await loadProducts();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setTrackError(axiosErr.response?.data?.error ?? 'Failed to track product.');
      } else {
        setTrackError('Failed to track product.');
      }
    } finally {
      setTracking(false);
    }
  };

  const handleUntrack = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Tracked Products</h1>
        <p className="text-gray-500">Track a product by pasting an Amazon or Flipkart URL below.</p>
      </div>

      {/* Track new product */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Track a new product</h2>
        </div>
        <SearchBar onTrack={handleTrack} loading={tracking} />
        {trackError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {trackError}
          </p>
        )}
        {trackSuccess && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            {trackSuccess}
          </p>
        )}
      </div>

      {/* Product list */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No products tracked yet</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Paste a product URL above to start tracking its price history.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((tp) => (
            <ProductCard key={tp._id} trackedProduct={tp} onUntrack={handleUntrack} />
          ))}
        </div>
      )}
    </div>
  );
}
