"use client";
import Link from "next/link";
import { ShoppingBag, Store , Truck, CircleDollarSignIcon} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { UserButton, SignUpButton, SignInButton, SignedIn , SignedOut} from "@clerk/nextjs";
import { Button } from "./ui/button";

export default function Header() {
  const { getItemCount } = useCart();
  const count = getItemCount();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">
            ThriftVault
          </span>
        </Link>
        <div className="flex items-center gap-2">
        <SignedOut>
        <Link href="/sign-in">
          <Button className="mt-1">SignIn</Button>
        </Link>
        </SignedOut>
        <SignedIn>
          <UserButton/>
          <Link
          href="/OrderPage"
          className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Truck className="h-5 w-5" />
          <span className="hidden sm:inline">Orders</span>
        </Link>
          <Link
          href="/VendorPage"
          className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <CircleDollarSignIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Vendor</span>
        </Link>
        </SignedIn>
        <Link
          href="/CartPage"
          className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
              {count}
            </Badge>
          )}
        </Link>
        </div>
      </div>
    </header>
  );
}
