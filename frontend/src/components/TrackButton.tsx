'use client';

import { useState } from 'react';
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { trackProduct, untrackProduct } from '@/lib/api';

interface TrackButtonProps {
  productId: string;
  isTracked: boolean;
  onTrackChange: (tracked: boolean) => void;
}

export default function TrackButton({ productId, isTracked, onTrackChange }: TrackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isTracked) {
        await untrackProduct(productId);
        onTrackChange(false);
      } else {
        // Re-track by product ID — pass empty string; actual re-tracking done via URL
        // The product already exists so we just upsert the tracking record
        await trackProduct(`/product-retrack/${productId}`);
        onTrackChange(true);
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  if (isTracked) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <BookmarkCheck size={15} className="text-green-600" />
        )}
        {loading ? 'Removing…' : 'Tracked — Remove'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <BookmarkPlus size={15} />
      )}
      {loading ? 'Tracking…' : 'Track this product'}
    </button>
  );
}
