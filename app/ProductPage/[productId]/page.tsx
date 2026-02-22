"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Product, Store } from "@/types";

export default function ProductPage() {
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  // Fetch Product and its associated Store from MongoDB
  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) return;
      setIsLoading(true);
      try {
        // 1. Fetch the specific product
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();

        if (productData.error) throw new Error(productData.error);
        setProduct(productData);

        // 2. Fetch the store that owns this product
        const storeRes = await fetch(`/api/stores/${productData.storeId}`);
        const storeData = await storeRes.json();

        if (!storeData.error) setStore(storeData);
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const success = addToCart(product);
      if (success) {
        setAdded(true);
        toast.success("Added to cart!");
        setTimeout(() => setAdded(false), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading item details...</p>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-medium text-muted-foreground">Product not found.</p>
        <Link href="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="container-page animate-fade-in py-8">
      <Link
        href={`/StorePage/${store.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {store.name}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted border">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                    i === selectedImage
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-2">
            {product.brand || "Vintage"}
          </Badge>

          <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight">
            {product.name}
          </h1>

          <p className="mt-4 font-heading text-4xl font-bold text-primary">
            Rs. {product.price}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">Size: {product.size}</Badge>
            <Badge variant="outline" className="px-3 py-1 capitalize">{product.condition}</Badge>
            <Badge variant="outline" className="px-3 py-1">{product.gender}</Badge>
            <Badge variant="outline" className="px-3 py-1">{product.category}</Badge>
          </div>

          <div className="mt-8 prose prose-sm text-muted-foreground">
            <h3 className="text-foreground font-semibold mb-2">Description</h3>
            <p className="leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-muted flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground block">Sold by</span>
              <Link
                href={`/StorePage/${store.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {store.name}
              </Link>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{store.location}</p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={product.quantity < 1}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-6 w-6" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-6 w-6" />
                  Add to Cart
                </>
              )}
            </Button>

            {product.quantity < 1 && (
              <p className="mt-3 text-center text-sm font-medium text-destructive">
                This item is currently out of stock.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}