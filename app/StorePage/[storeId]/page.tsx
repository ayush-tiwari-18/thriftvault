"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Store, Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categories = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Accessories", "Shoes"] as const;
const genders = ["All", "Men", "Women", "Unisex"] as const;

export default function StorePage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const [store, setStore] = useState<Store | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [category, setCategory] = useState<string>("All");
  const [gender, setGender] = useState<string>("All");
  const [sort, setSort] = useState<string>("newest");

  // Fetch Store and Products from MongoDB
  useEffect(() => {
    async function fetchData() {
      if (!storeId) return;
      setIsLoading(true);
      try {
        // Fetch Store Details
        const storeRes = await fetch(`/api/stores/${storeId}`);
        const storeData = await storeRes.json();
        
        // Fetch Products for this Store
        const productsRes = await fetch(`/api/products?storeId=${storeId}`);
        const productsData = await productsRes.json();

        if (!storeData.error) setStore(storeData);
        if (!productsData.error) setAllProducts(productsData);
      } catch (err) {
        console.error("Failed to load store data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [storeId]);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (category !== "All")
      result = result.filter((p) => p.category === category);

    if (gender !== "All")
      result = result.filter((p) => p.gender === gender);

    if (sort === "price-low")
      result.sort((a, b) => a.price - b.price);
    else if (sort === "price-high")
      result.sort((a, b) => b.price - a.price);
    else
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [allProducts, category, gender, sort]);

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Store not found.</p>
          <Link href="/" className="text-primary hover:underline mt-2 block">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Store Banner */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={store.bannerImage}
          alt={store.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-page absolute inset-0 flex flex-col justify-end pb-6">
          <Link href="/" className="mb-3 flex w-fit items-center gap-1 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            All Stores
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white">{store.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            {store.location}
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <p className="mb-6 text-muted-foreground max-w-2xl">{store.description}</p>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge
                key={c}
                variant={category === c ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setCategory(c)}
              >
                {c}
              </Badge>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No items match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}