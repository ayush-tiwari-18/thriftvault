"use client"
import Link from 'next/link';
import { MapPin, Package } from 'lucide-react';
import { Store } from '@/types';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/StorePage/${store.id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={store.bannerImage}
          alt={store.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <h3 className="font-heading text-xl font-bold text-card">{store.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {store.location}
          </span>
          <span className="flex items-center gap-1 font-medium text-primary">
            <Package className="h-3.5 w-3.5" />
            {store.activeItems} items
          </span>
        </div>
      </div>
    </Link>
  );
}
