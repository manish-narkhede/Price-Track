"use client";
import Link from "next/link";
import {useAuth} from "@/context/AuthContext";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase";
import {useRouter} from "next/navigation";

export default function Navbar() {
  const {user} = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          PriceTrack
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-red-500 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
