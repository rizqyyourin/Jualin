'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2, ShoppingBag, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecommendations, useTrendingProducts, useBestsellerProducts } from '@/lib/hooks/useRecommendations';
import { WishlistButton } from '@/components/products/WishlistButton';
import { useCartStore } from '@/lib/stores/cartStore';
import { useNotifications } from '@/lib/stores/notificationStore';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useUserStore } from '@/lib/stores/userStore';
import { RecommendedProduct } from '@/lib/api/recommendations';

interface RecommendationsCarouselProps {
  productId?: string | number;
  type?: 'similar' | 'trending' | 'bestsellers';
  limit?: number;
  title?: string;
  showArrows?: boolean;
}

export const RecommendationsCarousel = ({
  productId,
  type = 'similar',
  limit = 6,
  title,
  showArrows = true,
}: RecommendationsCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { success, error } = useNotifications();
  const { isAuthenticated } = useUserStore();
  const { openLoginModal } = useAuthModal();
  const addToCart = useCartStore((state) => state.addItem);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  // Select hook based on type
  let data;
  if (type === 'similar' && productId) {
    const result = useRecommendations({
      productId,
      type,
      limit,
    });
    data = result;
  } else if (type === 'trending') {
    const result = useTrendingProducts(limit);
    data = { ...result, refetch: async () => { } };
  } else if (type === 'bestsellers') {
    const result = useBestsellerProducts(limit);
    data = { ...result, refetch: async () => { } };
  } else {
    data = { recommendations: [], loading: false, error: null, refetch: async () => { } };
  }

  const { recommendations, loading } = data as any;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 350; // card width + gap
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const newPosition = direction === 'left'
      ? currentScroll - scrollAmount
      : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = async (product: RecommendedProduct) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    setAddingProductId(productId);
    try {
      await addToCart(productId, 1);
      success('Added to cart!');
    } catch (err) {
      error('Failed to add to cart');
    } finally {
      setAddingProductId(null);
    }
  };

  const defaultTitle = type === 'similar'
    ? 'Customers Also Viewed'
    : type === 'trending'
      ? 'Trending Now'
      : 'Best Sellers';

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-gray-600">Finding recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  // Fallback images array
  const fallbackImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title || defaultTitle}</h2>
          {recommendations.length > 0 && (
            <div className="h-1 w-20 bg-primary mt-2 rounded-full"></div>
          )}
        </div>

        {/* Manual Arrows (Always Visible on Desktop) */}
        {showArrows && recommendations.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Items Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar md:scrollbar-default"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendations.map((product: RecommendedProduct, index: number) => {
            // Logic to pick image: real > mock placeholder fix > fallback loop
            let imageUrl = product.image;
            if (!imageUrl || imageUrl.startsWith('/')) {
              imageUrl = fallbackImages[index % fallbackImages.length];
            }

            return (
              <Card
                key={product.id}
                className="snap-center flex-shrink-0 w-72 overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 group/card"
              >
                {/* Image */}
                <Link href={`/shop/${product.id}`} className="block relative bg-gray-100 h-64 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}

                  {/* Reason Badge */}
                  {product.reason && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.reason}
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity transform translate-y-2 group-hover/card:translate-y-0">
                    <WishlistButton
                      item={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: imageUrl,
                        category: product.category,
                      }}
                      variant="rounded"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    {product.category && (
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {product.category}
                      </p>
                    )}

                    <Link href={`/shop/${product.id}`} className="block">
                      <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-700">
                          {Number(product.rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingProductId === (typeof product.id === 'string' ? parseInt(product.id, 10) : product.id)}
                    className="w-full bg-gray-900 hover:bg-primary text-white py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    {addingProductId === (typeof product.id === 'string' ? parseInt(product.id, 10) : product.id) ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
