import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import StoreConflictModal from "@/components/StoreConflictModal";
import Script from "next/script"; // Import the Script component
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThriftVault | Pre-Loved Fashion",
  description: "Curated vintage finds from local thrift stores.",
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
          {/* PhonePe Checkout SDK - Required for the IFrame and transact function */}
          <Script 
            src="https://mercury.phonepe.com/web/bundle/checkout.js" 
            strategy="beforeInteractive" // Ensures SDK is ready for CheckoutPage
          />

          <TooltipProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              
              {/* UI Overlay Components */}
              <Toaster />
              <Sonner position="top-center" richColors />
              <StoreConflictModal />
            </CartProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}