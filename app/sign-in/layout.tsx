import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import "@/app/globals.css";
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
          <TooltipProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
          </TooltipProvider>
  );
}