'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingDown, LayoutDashboard, LogIn, LogOut, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingDown className="text-white" size={18} />
          </div>
          PriceTrack
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogIn size={15} />
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                <UserPlus size={15} className="inline mr-1.5" />
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn size={15} /> Sign in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 text-sm text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50"
                onClick={() => setMenuOpen(false)}
              >
                <UserPlus size={15} /> Sign up free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
