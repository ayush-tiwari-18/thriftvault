"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { getProductById, getStoreById } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductPage() {
  const params = useParams();
  const productId = params?.productId as string;

  const product = getProductById(productId || "");
  const store = product ? getStoreById(product.storeId) : undefined;

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product || !store) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    const success = addToCart(product);
    if (success) {
      setAdded(true);
      toast.success("Added to cart!");
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="container-page animate-fade-in py-8">
      <Link
        href={`/store/${store.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {store.name}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-3/4 overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border-2 transition-colors ${
                    i === selectedImage
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-muted-foreground">
            {product.brand}
          </p>

          <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">
            {product.name}
          </h1>

          <p className="mt-4 font-heading text-3xl font-bold text-foreground">
            ${product.price}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline">
              Size: {product.size}
            </Badge>
            <Badge variant="outline">
              {product.condition}
            </Badge>
            <Badge variant="outline">
              {product.gender}
            </Badge>
            <Badge variant="outline">
              {product.category}
            </Badge>
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            Sold by{" "}
            <Link
              href={`/store/${store.id}`}
              className="font-medium text-primary hover:underline"
            >
              {store.name}
            </Link>
          </div>

          <Button
            onClick={handleAddToCart}
            className="mt-8 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            disabled={product.quantity < 1}
          >
            {added ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </>
            )}
          </Button>

          {product.quantity < 1 && (
            <p className="mt-2 text-center text-sm text-destructive">
              Out of stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
