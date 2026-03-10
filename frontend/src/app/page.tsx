'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingDown, Bell, BarChart2, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Price History Graphs',
    description: 'Visualize price trends over 30, 90, or 365 days with interactive charts.',
  },
  {
    icon: TrendingDown,
    title: 'Lowest Price Tracking',
    description: 'Always know the all-time lowest price so you never overpay.',
  },
  {
    icon: Bell,
    title: 'Price Drop Alerts',
    description: 'Set a target price and get notified by email when the price drops.',
  },
  {
    icon: ShoppingBag,
    title: 'Amazon & Flipkart',
    description: 'Supports both major Indian e-commerce platforms out of the box.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleTrack = async (url: string) => {
    setLoading(true);
    // Redirect to dashboard with intent to track — auth guard will handle login
    router.push(`/dashboard?track=${encodeURIComponent(url)}`);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Shield size={14} />
            Amazon &amp; Flipkart Price Tracker
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Stop Overpaying.<br />
            <span className="text-blue-200">Track Prices, Save More.</span>
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Paste any Amazon or Flipkart product link to view its full price history,
            lowest recorded price, and set alerts for when it drops.
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar onTrack={handleTrack} loading={loading} large />
          </div>

          <p className="text-blue-200 text-sm mt-4">
            Works with amazon.in and flipkart.com product URLs
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything you need to shop smarter
            </h2>
            <p className="text-gray-500 text-lg">
              PriceTrack gives you the data to make confident purchase decisions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card hover:shadow-md transition-shadow duration-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Paste a URL', desc: 'Copy any Amazon or Flipkart product link.' },
              { step: '2', title: 'View history', desc: 'See the full price timeline and lowest price.' },
              { step: '3', title: 'Set an alert', desc: 'Enter your target price and get notified on drop.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start saving?</h2>
          <p className="text-blue-100 mb-7">Create a free account to track products and receive alerts.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-150"
          >
            Get started for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
