"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle, Package, Loader2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const merchantOrderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error" | "conflict">("loading");

  useEffect(() => {
    async function verifyAndFetchOrder() {
      if (!merchantOrderId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/payment/status?merchantOrderId=${merchantOrderId}`);
        const data = await response.json();
        
        if (data.state === "COMPLETED") {
          setOrder(data);
          clearCart();
          
          // Check if the items were actually secured in DB
          if (data.inventoryConflict) {
             setStatus("conflict");
             toast.warning("Inventory conflict detected.");
          } else {
             setStatus("success");
          }
        } else if (data.state === "PENDING") {
          setStatus("pending");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    }

    verifyAndFetchOrder();
  }, [merchantOrderId, clearCart]);

  // UI STATE: LOADING
  if (status === "loading") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Verifying your payment with PhonePe...</p>
      </div>
    );
  }

  // UI STATE: PENDING (Webhook delay)
  if (status === "pending") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center gap-4">
        <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />
        <h1 className="text-2xl font-bold">Payment is Processing</h1>
        <p className="text-muted-foreground max-w-xs">
          PhonePe is confirming your transaction. This usually takes a few seconds.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Status</Button>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center gap-4">
        <AlertTriangle className="h-16 w-16 text-orange-500" />
        <h1 className="text-2xl font-bold">Payment Received, but Item Sold Out!</h1>
        <p className="text-muted-foreground max-w-sm">
          A race condition occurred. Another student secured this item a millisecond before you. 
          Please contact support for an immediate manual refund.
        </p>
        <Link href="/support"><Button variant="outline">Contact Support</Button></Link>
      </div>
    );
  }

  // UI STATE: ERROR
  if (status === "error") {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center animate-fade-in">
        <p className="text-muted-foreground text-center max-w-xs">
          We couldn't verify your order. If you've paid, please check your "My Orders" section in a few minutes.
        </p>
        <div className="flex gap-4 mt-6">
          <Link href="/OrderPage">
            <Button variant="default">View Orders</Button>
          </Link>
          <Link href="/">
            <Button variant="default">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // UI STATE: SUCCESS
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center animate-fade-in py-12">
      <CheckCircle className="h-16 w-16 text-primary" />

      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">
        Order Confirmed!
      </h1>

      <p className="mt-2 text-muted-foreground">
        Your ThriftVault find is secured!
      </p>

      <div className="mt-8 w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          Order #{order?.id?.toUpperCase().slice(-8)}
        </div>

        {order && (
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-heading font-bold text-foreground text-lg">
              <span>Amount Paid</span>
              <span>Rs. {(order.totalAmount).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              ✓ Verified via PhonePe Gateway
            </p>
          </div>
        )}
      </div>

      <Link href="/OrderPage">
        <Button className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 px-8">
          View My Orders
        </Button>
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="container-page flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}