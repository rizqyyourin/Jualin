'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  rating = 0,
  reviews = 0,
  inStock = true,
  className,
}: ProductCardProps) {
  return (
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col ${className || ''}`}>
      {/* Product Details Link - clickable */}
      <Link href={`/shop/${id}`} className="flex-1">
        <div className="cursor-pointer h-full flex flex-col">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-48 w-full">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Stock Badge */}
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}

            {/* Favorite Button */}
            <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
              <WishlistButton
                item={{
                  id,
                  name,
                  price,
                  image,
                  category,
                }}
                variant="rounded"
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition">
                {name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({reviews})</span>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  ${price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Links to Detail Page */}
      <div className="p-4 border-t">
        <Link href={`/shop/${id}`}>
          <Button
            disabled={!inStock}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-primary-foreground py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </Link>
      </div>
    </Card>
  );
}
