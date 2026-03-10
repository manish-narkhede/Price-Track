import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
export const dynamic = "force-dynamic";
import {AuthProvider} from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "PriceTrack — Amazon & Flipkart Price History",
  description: "Track price history and get alerts for Amazon and Flipkart products.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
