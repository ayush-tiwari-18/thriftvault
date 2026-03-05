"use client";
import React from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Loader2,
  SlidersHorizontal,
  ArrowLeft,
  Store as StoreIcon,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductCard from "@/components/ProductCard";
import { Store, Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

const categories = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Accessories",
  "Shoes",
  "sold",
] as const;
const genders = ["Men", "Women", "Unisex"] as const;

const deleteButtonStyle: React.CSSProperties = {
  position: "absolute", // Now TS recognizes this as a valid 'Position' type
  top: "4px",
  right: "4px",
  backgroundColor: "#ef4444",
  color: "white",
  borderRadius: "9999px",
  padding: "4px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s ease",
  zIndex: 10,
};

export default function VendorDashboard() {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (Initialized with empty strings to prevent controlled/uncontrolled errors)
  const [newProduct, setNewProduct] = useState({
    size: "",
    brand: "",
    name: "",
    price: "",
    category: "Tops",
    gender: "Unisex",
    description: "",
    images: [] as string[],
    condition: "",
    quantity: "",
  });
  const [storeUpdate, setStoreUpdate] = useState({
    name: "",
    description: "",
    location: "",
    bannerImage: "",
    logoImage: "",
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [sort, setSort] = useState<string>("newest");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/merchant/status");
      const data = await res.json();
      if (data.isApproved) {
        setIsApproved(true);
        setStore(data.store);
        // Syncing state with database values or fallbacks
        setStoreUpdate({
          name: data.store.name || "",
          description: data.store.description || "",
          location: data.store.location || "",
          bannerImage: data.store.bannerImage || "",
          logoImage: data.store.logoImage || "",
        });
        setAllProducts(
          data.products.map((p: any) => ({
            ...p,
            id: p._id?.toString() || p.id,
          })),
        );
      } else {
        setIsApproved(false);
      }
    } catch (err) {
      toast.error("Failed to connect to merchant portal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price)
      return toast.error("Please fill required fields");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          storeId: store?._id,
          storeName: store?.name,
          price: Number(newProduct.price),
        }),
      });
      if (res.ok) {
        toast.success("Product listed successfully!");
        setIsAddProductOpen(false);
        setNewProduct({
          size: "",
          brand: "",
          name: "",
          price: "",
          category: "Tops",
          gender: "Unisex",
          description: "",
          images: [],
          condition: "",
          quantity: "",
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Error adding product");
    }
    setIsSubmitting(false);
  };

  const conditions = ["New with tags", "Like new", "Good", "Fair"] as const;

  const handleUpdateStore = async () => {
    if (!storeUpdate.name) return toast.error("Store name is required");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/merchant/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store?._id,
          ...storeUpdate,
        }),
      });

      if (res.ok) {
        toast.success("Store profile updated!");
        setIsEditStoreOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating store profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/merchant/products?id=${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAllProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success("Deleted successfully");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (categoryFilter === "sold") {
      result = result.filter((p) => Number(p.quantity) === 0);
    } 
    // 2. For "All" and all other categories, hide items with 0 quantity
    else {
      result = result.filter((p) => Number(p.quantity) > 0);

      // Further filter by specific category (Tops, Bottoms, etc.) if not "All"
      if (categoryFilter !== "All") {
        result = result.filter((p) => p.category === categoryFilter);
      }
    }
    if (genderFilter !== "All")
      result = result.filter((p) => p.gender === genderFilter);
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    else
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return result;
  }, [allProducts, categoryFilter, genderFilter, sort]);

  if (isLoading)
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Verifying Access...
        </p>
      </div>
    );

  if (isApproved === false)
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <StoreIcon className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold">Become a Partner</h1>
        <Link
          href="https://forms.gle/..."
          target="_blank"
          className="mt-8 bg-primary text-white px-8 py-3 rounded-md flex items-center gap-2"
        >
          Fill Application <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    toast.loading("Uploading images...");

    try {
      // Process all selected files
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "thriftvault_uploads");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Use functional update to append new URLs to the string[] array
      setNewProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.dismiss();
      toast.success(`${uploadedUrls.length} image(s) uploaded!`);
    } catch (err) {
      toast.dismiss();
      toast.error("One or more uploads failed");
      console.error(err);
    }
  };

  // Helper function to remove an image
  const removeImage = (indexToRemove: number) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleFileUploadBanner = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "thriftvault_uploads"); // Your Unsigned Preset

    try {
      toast.loading("Uploading...");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      setStoreUpdate({ ...storeUpdate, bannerImage: data.secure_url }); // Save the URL
      toast.dismiss();
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleFileUploadLogo = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "thriftvault_uploads"); // Your Unsigned Preset

    try {
      toast.loading("Uploading...");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      setStoreUpdate({ ...storeUpdate, logoImage: data.secure_url }); // Save the URL
      toast.dismiss();
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="animate-fade-in relative pb-20">
      {/* BANNER */}
      <div className="relative h-56 overflow-hidden group">
        <img
          src={
            store?.bannerImage ||
            "https://static.vecteezy.com/system/resources/thumbnails/049/033/798/small/3d-black-geometric-abstract-background-overlap-layer-on-dark-space-with-waves-lines-decoration-minimalist-modern-graphic-design-element-cutout-style-concept-for-banner-flyer-card-or-brochure-cover-vector.jpg"
          }
          alt={store?.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-page absolute inset-0 flex flex-col justify-end pb-6">
          <div className="flex justify-between items-end">
            <div>
              <Link
                href="/"
                className="mb-3 flex w-fit items-center gap-1 text-sm text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back Home
              </Link>
              <h1 className="font-heading text-3xl font-bold text-white">
                {store?.name}
              </h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
                <MapPin className="h-3.5 w-3.5" />{" "}
                {store?.location || "Location not set"}
              </div>
            </div>
            {/* Styled Edit Profile Button */}
            <Button
              onClick={() => setIsEditStoreOpen(true)}
              variant="secondary"
              size="sm"
              className="gap-2 bg-green-600 text-white hover:bg-green-700 border-none shadow-md px-5"
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <p className="mb-6 text-muted-foreground max-w-2xl">
          {store?.description || "No description provided."}
        </p>

        {/* FILTERS */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {["All", ...categories].map((c) => (
              <Badge
                key={c}
                variant={categoryFilter === c ? "default" : "outline"}
                className={`cursor-pointer ${categoryFilter === c ? "bg-green-600" : ""}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </Badge>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger
                className="w-28 !bg-green-600 !text-white !border-green-600"
                style={{ backgroundColor: "#16a34a", color: "white" }}
              >
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {genders.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                className="w-36 !bg-green-600 !text-white !border-green-600"
                style={{ backgroundColor: "#16a34a", color: "white" }}
              >
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

        {/* PRODUCT GRID */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No items match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                {categoryFilter !== "sold" && (
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full shadow-lg"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FIXED FLOATING ACTION BUTTON */}
      <Button
        onClick={() => setIsAddProductOpen(true)}
        className="fixed bottom-10 right-10 h-16 w-16 rounded-full shadow-2xl transition-all active:scale-90 z-[100]"
        style={{
          backgroundColor: "#16a34a",
          color: "white",
          right: "40px",
          bottom: "40px",
        }}
      >
        <Plus className="h-10 w-10 text-white" />
      </Button>

      {/* ADD PRODUCT DIALOG */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent
          style={{ height: "70vh", overflow: "scroll", width: "50%" }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Thrift Find
            </DialogTitle>
            <DialogDescription>
              List a new unique item in your storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* 1. MULTIPLE IMAGE UPLOAD */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">
                Product Images* (Upload multiple)
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {/* Display existing images with a delete button */}
                {newProduct.images.map((url, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Product ${index}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={deleteButtonStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#dc2626")
                      } // hover:bg-red-600
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ef4444")
                      } // reset to bg-red-500
                    >
                      <XCircle style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                ))}

                {/* The Upload Trigger Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("manual-upload")?.click()
                  }
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-green-600 hover:bg-green-50 transition-all"
                >
                  <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Add Photo
                  </span>
                </Button>
              </div>

              <input
                id="manual-upload"
                type="file"
                multiple // Allows selecting multiple files at once
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>

            {/* 2. CORE DETAILS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="prod-name">Item Name*</Label>
                <Input
                  id="prod-name"
                  placeholder="e.g. 90s Vintage Denim Jacket"
                  value={newProduct.name || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-brand">Brand</Label>
                <Input
                  id="prod-brand"
                  placeholder="e.g. Levi's"
                  value={newProduct.brand || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, brand: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-size">Size</Label>
                <Input
                  id="prod-size"
                  placeholder="e.g. XL / 32 / 10US"
                  value={newProduct.size || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, size: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 3. SCHEMA SELECTORS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, category: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={newProduct.gender}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, gender: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={newProduct.condition}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, condition: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 4. PRICING & INVENTORY */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price">Price (₹)*</Label>
                <Input
                  id="prod-price"
                  type="number"
                  placeholder="0.00"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description*</Label>
              <Textarea
                id="prod-desc"
                className="min-h-[100px]"
                placeholder="Condition notes, fabric details, and measurements..."
                value={newProduct.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              className="w-full h-12 text-lg font-bold transition-all shadow-lg"
              onClick={handleAddProduct}
              disabled={isSubmitting}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "List Item for Sale"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT STORE DIALOG */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Store Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Store logo</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("manual-upload")?.click()
                  }
                  style={{
                    width: "100%", // w-full
                    borderStyle: "solid", // border-dashed
                    borderWidth: "2px", // border-2
                    borderColor: "black", // border-green-600
                    color: "black", // text-green-700
                    backgroundColor: "transparent", // Default state
                    transition: "background-color 0.2s", // Smooth hover transition
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {storeUpdate.logoImage ? "Change Image" : "Upload Main Photo"}
                </Button>
                <input
                  id="manual-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUploadLogo}
                />
              </div>
              {storeUpdate.logoImage ? "Image Added" : ""}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Banner Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("manual-upload")?.click()
                  }
                  style={{
                    width: "100%", // w-full
                    borderStyle: "solid", // border-dashed
                    borderWidth: "2px", // border-2
                    borderColor: "black", // border-green-600
                    color: "black", // text-green-700
                    backgroundColor: "transparent", // Default state
                    transition: "background-color 0.2s", // Smooth hover transition
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {storeUpdate.bannerImage
                    ? "Change Image"
                    : "Upload Main Photo"}
                </Button>
                <input
                  id="manual-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUploadBanner}
                />
              </div>
              {storeUpdate.bannerImage ? "Image Added" : ""}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={storeUpdate.name || ""}
                onChange={(e) =>
                  setStoreUpdate({ ...storeUpdate, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-loc">Location</Label>
              <Input
                id="store-loc"
                value={storeUpdate.location || ""}
                onChange={(e) =>
                  setStoreUpdate({ ...storeUpdate, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-desc">Description</Label>
              <Textarea
                id="store-desc"
                value={storeUpdate.description || ""}
                onChange={(e) =>
                  setStoreUpdate({
                    ...storeUpdate,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={handleUpdateStore}
              disabled={isSubmitting}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Saving Changes..." : "Update Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
