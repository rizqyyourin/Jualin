'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, ChevronLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWishlist } from '@/lib/stores/wishlistStore';
import { useNotifications } from '@/lib/stores/notificationStore';
import { useCartStore } from '@/lib/stores/cartStore';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { success } = useNotifications();
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (item: any) => {
    addToCart(item.id, 1);
    success('Added to cart!');
  };

  const handleRemove = (itemId: string | number) => {
    removeFromWishlist(itemId);
    success('Removed from wishlist');
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
      success('Wishlist cleared');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              You have {items.length} item{items.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
          {items.length > 0 && (
            <Button
              onClick={handleClearWishlist}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      {items.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save your favorite items to your wishlist for easy access later!
          </p>
          <Link href="/shop">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No image available</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                {item.category && (
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    {item.category}
                  </p>
                )}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.name}
                </h3>

                <div className="mt-auto space-y-3">
                  <div className="text-2xl font-bold text-blue-600">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* View Product Link */}
                  <Link href={`/products/${item.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
