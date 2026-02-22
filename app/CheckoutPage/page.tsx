"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckoutFormData } from '@/types';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Initialize Stripe with your Public Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, getItemCount } = useCart(); 
  
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  const [form, setForm] = useState<CheckoutFormData>({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
  });

  useEffect(() => {
    // If cart is empty and we aren't showing the checkout UI, go back
    if (getItemCount() === 0 && !clientSecret) {
      router.push('/CartPage');
    }
  }, [getItemCount, router, clientSecret]);

  if (getItemCount() === 0 && !clientSecret) return null;

  const update = (field: keyof CheckoutFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before initiating Stripe
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.zipCode) {
      toast.error('Please fill in all shipping details first');
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize Stripe Session on the backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          storeName: cart.storeName,
          customerDetails: form, // Pass form data for potential metadata/receipts
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to initialize checkout");

      // 2. Set the clientSecret to trigger the Embedded UI
      setClientSecret(data.clientSecret);
      toast.success("Securing payment session...");

    } catch (err: any) {
      console.error("Stripe Initialization Error:", err);
      toast.error(err.message || "Could not connect to Stripe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page animate-fade-in py-8">
      <Link href="/CartPage" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="font-heading text-4xl font-black text-foreground">Checkout</h1>

      {/* If clientSecret exists, show Stripe. Otherwise, show the form. */}
      {clientSecret ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Secure Payment</h2>
              <Button variant="ghost" size="sm" onClick={() => setClientSecret(null)}>
                Edit Shipping Info
              </Button>
            </div>
            {/* Stripe Embedded Component */}
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" required />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" required />
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Shipping Address</h2>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={e => update('city', e.target.value)} placeholder="New York" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={e => update('state', e.target.value)} placeholder="NY" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} placeholder="10001" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">You will enter your card details securely via Stripe in the next step.</span>
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
                className="mt-8 w-full h-14 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing...</>
                ) : (
                  <><Lock className="mr-2 h-5 w-5" /> Continue to Payment</>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-bold">
                Securely encrypted by Stripe
              </p>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}