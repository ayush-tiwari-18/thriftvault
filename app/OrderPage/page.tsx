"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const { userId, isLoaded } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      // Don't attempt to fetch until Clerk has loaded the user session
      if (!isLoaded || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/orders");
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        // MongoDB Mapping Logic: Convert _id to id for each order
        const formattedOrders = data.map((order: any) => ({
          ...order,
          id: order._id?.toString() || order.id, 
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError("Could not load your orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [userId, isLoaded]);

  // Handle Loading State
  if (!isLoaded || isLoading) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Syncing with Cluster0...
        </p>
      </div>
    );
  }

  // Handle Authentication State
  if (!userId) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Package className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold">Please sign in</h2>
        <p className="text-muted-foreground">You need to be logged in to view your order history.</p>
      </div>
    );
  }

  return (
    <div className="container-page animate-fade-in py-12">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground">
          My Order History
        </h1>
        <p className="text-muted-foreground">
          Detailed receipts for all your vintage finds on ThriftVault.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-bold italic">Your vault is empty!</h2>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Looks like you haven't made any purchases yet. Your orders will appear here once you checkout.
          </p>
          <Link href="/">
          <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
          Start Browsing
        </Button>
        </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Each OrderCard utilizes the full horizontal width */}
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}