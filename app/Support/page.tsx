"use client";

import React, { useState } from "react";
import { Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupportPage() {
  const contacts = [
    { label: "Payment & Orders", phone: "+91 7009520608" },
    { label: "Technical Issues", phone: "+91 8178308335" },
  ];

  return (
    <div className="container-page py-10 max-w-lg mx-auto text-center">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Support</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Contact us if you face any issues with your ThriftVault order.
      </p>

      <div className="space-y-4">
        {contacts.map((c, i) => (
          <div key={i} className="p-6 border rounded-xl flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
            <p className="text-2xl font-mono font-bold">{c.phone}</p>
            <div className="flex gap-2 w-full mt-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2  bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://wa.me/${c.phone.replace(/\s/g, '')}`, '_blank')}
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
              <Button 
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = `tel:${c.phone}`}
              >
                <Phone className="h-4 w-4" /> Call
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 border rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Test Payment (Razorpay)</h2>
        <PaymentWidget />
      </div>
    </div>
  );
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function PaymentWidget() {
  const [amount, setAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const ok = await loadRazorpayScript();
    if (!ok) {
      alert("Failed to load Razorpay SDK");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "ThriftVault",
        order_id: data.order_id,
        handler: async function (response: any) {
          // Send to backend for verification
          const verify = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const v = await verify.json();
          if (verify.ok && v.success) {
            alert("Payment verified successfully");
          } else {
            alert(v?.error || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment popup closed");
          },
        },
      } as any;

      const rzp = new (window as any).Razorpay(options);
      rzp.on && rzp.on("payment.failed", function (resp: any) {
        alert("Payment failed: " + (resp?.error?.description || "Unknown"));
      });
      rzp.open();
    } catch (err: any) {
      alert(err?.message || "Payment error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full flex items-center gap-2">
        <input
          type="number"
          min={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 px-3 py-2 border rounded"
        />
        <span className="text-sm">paise</span>
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Processing…" : "Pay with Razorpay"}
      </button>
    </div>
  );
}
