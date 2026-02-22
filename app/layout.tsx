import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import StoreConflictModal from "@/components/StoreConflictModal";
import "./globals.css";

// 1. Keep fonts at the top
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Next.js App",
  description: "MERN migration to Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* 2. All providers and UI components must be INSIDE the body */}
          <TooltipProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              
              {/* UI Overlay Components */}
              <Toaster />
              <Sonner />
              <StoreConflictModal />
            </CartProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}