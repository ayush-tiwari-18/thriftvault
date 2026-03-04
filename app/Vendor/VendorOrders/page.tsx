"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, ShoppingBag, StoreIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";
import VendorOrderCard from "@/components/VendorOrderCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OrderPage() {
  const { userId, isLoaded } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Clerk to load the session before making API calls
    if (!isLoaded || !userId) return;

    const initializePage = async () => {
      setIsLoading(true);
      try {
        // 1. Check Merchant Approval Status first
        const statusRes = await fetch("/api/merchant/status");
        if (!statusRes.ok) throw new Error("Status check failed");
        
        const statusData = await statusRes.json();
        
        if (!statusData.isApproved) {
          setIsApproved(false);
          setIsLoading(false);
          return; // Exit early if the user isn't an approved vendor
        }
        
        setIsApproved(true);

        // 2. Only fetch orders if the vendor is approved
        const orderRes = await fetch("/api/merchant/orders");
        if (!orderRes.ok) throw new Error("Failed to fetch orders");
        
        const orderData = await orderRes.json();

        // Map MongoDB _id to standard id for the OrderCard component
        const formattedOrders = orderData.map((order: any) => ({
          ...order,
          id: order._id?.toString() || order.id,
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError("Could not sync with the Vault. Please refresh the page.");
        toast.error("Connection error");
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [userId, isLoaded]);

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Verifying your credentials...
        </p>
      </div>
    );
  }

  // UNAPPROVED VENDOR STATE
  if (isApproved === false) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <StoreIcon className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Become a Merchant</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Access to order history is reserved for approved partners. Apply to join our curated marketplace.
        </p>
        <Link
          href="https://forms.gle/..."
          target="_blank"
          style={{ backgroundColor: "#16a34a" }}
          className="mt-8 text-white px-8 py-3 rounded-md flex items-center gap-2 transition-all hover:opacity-90"
        >
          Fill Application <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // MAIN ORDER HISTORY VIEW
  return (
    <div className="container-page animate-fade-in py-12">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-black tracking-tight text-foreground">
          My Sales History
        </h1>
        <p className="text-muted-foreground">
          View and manage fulfillment for all your vintage items sold on ThriftVault.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold">No sales yet!</h2>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Once customers start buying your vintage finds, their orders will appear right here.
          </p>
          <Link href="/Vendor/VendorPage">
            <Button 
              style={{ backgroundColor: "#16a34a" }} 
              className="mt-8 text-white px-8 hover:opacity-90"
            >
              List Your Items
            </Button>
          </Link>
        </div>
      ) : (
        /* LIST OF ORDERS */
        <div className="flex flex-col gap-8">
          {orders.map((order) => (
            <VendorOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}