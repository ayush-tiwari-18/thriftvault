"use client"
import Link from 'next/link';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const conditionColors: Record<string, string> = {
  'New with tags': 'bg-primary text-primary-foreground',
  'Like new': 'bg-primary/80 text-primary-foreground',
  'Good': 'bg-secondary text-secondary-foreground',
  'Fair': 'bg-muted text-muted-foreground',
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/ProductPage/${product.id}`}
      className="group block overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-md"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <Badge className={`absolute left-2 top-2 text-xs ${conditionColors[product.condition]}`}>
          {product.condition}
        </Badge>
      </div>

      <div className="p-3">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-medium text-foreground">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-foreground">Rs.{product.price}</span>
          <span className="text-xs text-muted-foreground">Size {product.size}</span>
        </div>
      </div>
    </Link>
  );
}
