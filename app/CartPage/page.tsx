"use client"

import Link from 'next/link';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { cart, removeFromCart, getTotal, getItemCount } = useCart();

  if (getItemCount() === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center animate-fade-in">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="font-heading text-2xl font-bold text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Find something you love from our stores.</p>
        <Link href="/">
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Browse Stores</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page animate-fade-in py-8">
      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="font-heading text-3xl font-bold text-foreground">Your Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">Items from <strong>{cart.storeName}</strong></p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 rounded-lg border bg-card p-4">
              <img src={product.images[0]} alt={product.name} className="h-24 w-20 rounded object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">Size: {product.size} · {product.condition}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-bold text-foreground">Rs.{product.price * quantity}</span>
                  <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground transition-colors hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-heading text-lg font-bold text-foreground">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({getItemCount()} items)</span>
              <span>Rs.{getTotal()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-heading text-lg font-bold text-foreground">
              <span>Total</span>
              <span>Rs.{getTotal()}</span>
            </div>
          </div>
          <Link href="/CheckoutPage">
            <Button className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
