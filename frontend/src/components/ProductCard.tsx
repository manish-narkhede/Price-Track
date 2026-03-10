'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrendingDown, TrendingUp, Bell, BellOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TrackedProduct } from '@/types';
import { untrackProduct } from '@/lib/api';

interface ProductCardProps {
  trackedProduct: TrackedProduct;
  onUntrack: (productId: string) => void;
}

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ProductCard({ trackedProduct, onUntrack }: ProductCardProps) {
  const { _id: trackingId, productId: product, alertEnabled, alertPrice } = trackedProduct;
  const [removing, setRemoving] = useState(false);

  if (!product || typeof product === 'string') return null;

  const savingPercent =
    product.highestPrice > product.lowestPrice
      ? Math.round(
          ((product.highestPrice - product.currentPrice) / product.highestPrice) * 100
        )
      : 0;

  const isAtLowest = product.currentPrice <= product.lowestPrice;

  const handleUntrack = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Remove this product from tracking?')) return;
    setRemoving(true);
    try {
      await untrackProduct(product._id);
      onUntrack(trackingId);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <Link href={`/product/${product._id}`}>
      <div className="card hover:shadow-md transition-all duration-200 cursor-pointer group relative">
        {/* Remove button */}
        <button
          onClick={handleUntrack}
          disabled={removing}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
          title="Remove from tracking"
        >
          <Trash2 size={15} />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-3"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-200 text-4xl">📦</div>
          )}
          {isAtLowest && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Lowest Price!
            </div>
          )}
        </div>

        {/* Platform badge */}
        <span className={product.platform === 'amazon' ? 'badge-amazon' : 'badge-flipkart'}>
          {product.platform === 'amazon' ? 'Amazon' : 'Flipkart'}
        </span>

        {/* Title */}
        <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-3 pr-6">
          {product.title}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.currentPrice)}
          </span>
          {savingPercent > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.highestPrice)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 text-green-600">
            <TrendingDown size={12} />
            Low: {formatPrice(product.lowestPrice)}
          </span>
          {savingPercent > 0 && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 font-medium px-1.5 py-0.5 rounded">
              <TrendingUp size={11} />
              {savingPercent}% off high
            </span>
          )}
        </div>

        {/* Alert status */}
        {alertEnabled && alertPrice && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
            <Bell size={12} />
            Alert set at {formatPrice(alertPrice)}
          </div>
        )}
        {!alertEnabled && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <BellOff size={12} />
            No alert set
          </div>
        )}
      </div>
    </Link>
  );
}
