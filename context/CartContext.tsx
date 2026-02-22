"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Cart, Product } from '@/types';
import { useAuth } from '@clerk/nextjs';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  conflictProduct: Product | null;
  setConflictProduct: (product: Product | null) => void;
  forceAddToCart: (product: Product) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const [cart, setCart] = useState<Cart>({ storeId: null, storeName: '', items: [] });
  const [conflictProduct, setConflictProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Auth Sync Logic: Fetch from DB on login / Clear on logout
  useEffect(() => {
    async function syncCart() {
      if (!isLoaded) return;

      if (userId) {
        // USER LOGGED IN: Fetch saved cart from Cluster0
        // This will overwrite/discard any items added as a guest
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          if (data && !data.error) {
            setCart(data);
          }
        } catch (err) {
          console.error("Cart fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // USER SIGNED OUT: Wipes the local cart immediately
        setCart({ storeId: null, storeName: '', items: [] });
        setIsLoading(false);
      }
    }

    syncCart();
  }, [userId, isLoaded]); // Triggers on every auth state change

  // Helper to push changes to MongoDB
  const persistCart = async (updatedCart: Cart) => {
    if (!userId) return; // Only save to DB if logged in
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCart),
      });
    } catch (err) {
      console.error("Failed to persist cart:", err);
    }
  };

  const addToCart = useCallback((product: Product): boolean => {
    // Single-Vendor Rule
    if (cart.storeId && cart.storeId !== product.storeId) {
      setConflictProduct(product);
      return false;
    }

    const existing = cart.items.find(item => item.product.id === product.id);
    let newItems = existing 
      ? cart.items.map(item => item.product.id === product.id 
          ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) } 
          : item)
      : [...cart.items, { product, quantity: 1 }];

    const newCart = { ...cart, storeId: product.storeId, items: newItems };
    setCart(newCart);
    persistCart(newCart);
    return true;
  }, [cart, userId]);

  const forceAddToCart = useCallback((product: Product) => {
    const newCart = {
      storeId: product.storeId,
      storeName: '', 
      items: [{ product, quantity: 1 }],
    };
    setCart(newCart);
    persistCart(newCart);
    setConflictProduct(null);
  }, [userId]);

  const removeFromCart = useCallback((productId: string) => {
    const newItems = cart.items.filter(item => item.product.id !== productId);
    const newCart = newItems.length === 0 
      ? { storeId: null, storeName: '', items: [] } 
      : { ...cart, items: newItems };
    
    setCart(newCart);
    persistCart(newCart);
  }, [cart, userId]);

  const clearCart = useCallback(() => {
    const emptyCart = { storeId: null, storeName: '', items: [] };
    setCart(emptyCart);
    persistCart(emptyCart);
  }, [userId]);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, clearCart, 
      getTotal: () => cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      getItemCount: () => cart.items.reduce((s, i) => s + i.quantity, 0),
      conflictProduct, setConflictProduct, forceAddToCart, isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}