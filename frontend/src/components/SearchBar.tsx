'use client';

import { useState, FormEvent } from 'react';
import { Link2, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onTrack: (url: string) => void;
  loading?: boolean;
  large?: boolean;
}

const PLACEHOLDER = 'Paste an Amazon or Flipkart product URL…';

export default function SearchBar({ onTrack, loading = false, large = false }: SearchBarProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    onTrack(trimmed);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Link2
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={PLACEHOLDER}
          required
          className={`input pl-9 ${large ? 'py-3.5 text-base' : ''}`}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className={`btn-primary whitespace-nowrap flex items-center gap-2 ${large ? 'py-3.5 px-6 text-base' : ''}`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Tracking…' : 'Track'}
      </button>
    </form>
  );
}
