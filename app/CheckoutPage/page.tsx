"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Lock, Loader2, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckoutFormData } from '@/types';
import Script from 'next/script'; // kept for compatibility if needed
import React from 'react';
import { useAuth } from '@clerk/nextjs';

export default function CheckoutPage() {
  const { userId } = useAuth(); // Get the authenticated userId
  const router = useRouter();
  const { cart, getTotal, getItemCount } = useCart(); 
  
  const [loading, setLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  
  const [form, setForm] = useState<CheckoutFormData>({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
  });

  useEffect(() => {
    if (getItemCount() === 0) {
      router.push('/CartPage');
    }
  }, [getItemCount, router]);

  const update = (field: keyof CheckoutFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.zipCode) {
      toast.error('Please fill in all shipping details first');
      return;
    }

    if (!isSdkLoaded) {
      toast.error('Payment system is still loading. Please wait a moment.');
      return;
    }

    setLoading(true);

    try {
      const merchantOrderId = `TV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Create order on backend (amount in paise)
      const amountPaise = Math.round(getTotal() * 100);
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise }),
      });
      const createData = await res.json();
      if (!res.ok) {
        throw new Error(createData?.error || 'Failed to create order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: createData.amount,
        currency: createData.currency,
        name: 'ThriftVault',
        order_id: createData.order_id,
        handler: async function (response: any) {
          // Send to backend for verification
          const verify = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const v = await verify.json();
          if (verify.ok && v.success) {
            // Redirect to confirmation (no DB persistence yet)
            router.push(`/ConfirmationPage?orderId=${merchantOrderId}&success=true`);
          } else {
            toast.error(v?.error || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment popup closed');
          },
        },
      } as any;

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Failed to load Razorpay SDK');

      const rzp = new (window as any).Razorpay(options);
      rzp.on && rzp.on('payment.failed', (resp: any) => {
        toast.error('Payment failed: ' + (resp?.error?.description || 'Unknown'));
      });
      rzp.open();

    } catch (err: any) {
      console.error('Payment Error:', err);
      toast.error(err?.message || 'Could not initiate payment.');
      setLoading(false);
    }
  };

  // Helper for loading Razorpay SDK dynamically
  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  if (getItemCount() === 0) return null;

  return (
    <div className="container-page animate-fade-in py-8">
      {/* Load Razorpay SDK Script (fallback) */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setIsSdkLoaded(true)}
      />

      <Link href="/CartPage" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="font-heading text-4xl font-black text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Section */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Ayush Tiwari" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="ayush@iitropar.ac.in" required />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="9999999999" required />
              </div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Shipping Address</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" value={form.address} onChange={e => update('address', e.target.value)} placeholder="IIT Ropar Hostel" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Rupnagar" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={e => update('state', e.target.value)} placeholder="Punjab" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} placeholder="140001" required />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info Section */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Secure Payment via Razorpay (UPI, Cards, NetBanking).</span>
              </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside>
          <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="font-heading text-xl font-bold text-foreground">Order Summary</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">From {cart.storeName}</p>
            
            <div className="space-y-4 mb-6">
              {cart.items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{product.name} <span className="text-foreground font-medium">×{quantity}</span></span>
                  <span className="font-bold text-foreground">Rs.{(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between font-heading text-2xl font-black text-primary">
                <span>Total</span>
                <span>Rs.{getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="mt-8 w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing...</>
              ) : (
                <><Lock className="mr-2 h-5 w-5" /> Pay Now</>
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
              Securely encrypted by Razorpay
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}