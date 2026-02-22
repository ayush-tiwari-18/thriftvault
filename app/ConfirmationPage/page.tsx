"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react"; // Added Suspense
import { CheckCircle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useCart } from "@/context/CartContext";

// 1. Separate the logic into a child component
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verifyAndFetchOrder() {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/checkout/confirm?session_id=${sessionId}`);
        const data = await response.json();
        
        if (response.ok && data.order) {
          setOrder({
            ...data.order,
            id: data.order._id?.toString() || data.order.id
          });
          
          clearCart();
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Confirmation Error:", error);
        setStatus("error");
      }
    }

    verifyAndFetchOrder();
  }, [sessionId, clearCart]);

  if (status === "loading") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Verifying payment with Stripe...</p>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center animate-fade-in">
        <p className="text-muted-foreground text-center max-w-xs">
          We couldn't verify your payment session. Please check your email or order history.
        </p>
        <Link href="/">
          <Button className="mt-6" variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center animate-fade-in py-12">
      <CheckCircle className="h-16 w-16 text-primary" />

      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
        Order Confirmed!
      </h1>

      <p className="mt-2 text-muted-foreground">
        Thank you for your purchase, {order.customerName}.
      </p>

      <div className="mt-8 w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          Order #{order.id.slice(-8).toUpperCase()}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Store: <strong className="text-foreground">{order.storeName}</strong>
        </p>

        <div className="mt-4 space-y-2 border-t pt-4">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.product.name} (x{item.quantity})
              </span>
              <span className="text-foreground">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between font-heading font-bold text-foreground text-lg">
            <span>Total Paid</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            ✓ Payment received via Stripe
          </p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground border-t pt-4">
          A receipt has been sent to {order.customerEmail}.
        </p>
      </div>

      <Link href="/">
        <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}

// 2. Wrap the dynamic content in Suspense for Vercel builds
export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}