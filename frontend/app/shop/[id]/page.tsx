'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ChevronLeft, Share2, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductReview } from '@/components/products/ProductReview';
import { WishlistButton } from '@/components/products/WishlistButton';
import { RecommendationsCarousel } from '@/components/products/RecommendationsCarousel';
import { useProduct } from '@/lib/hooks/useProducts';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useUserStore } from '@/lib/stores/userStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useNotifications } from '@/lib/stores/notificationStore';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { product, loading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { isAuthenticated } = useUserStore();
  const { openLoginModal } = useAuthModal();
  const addToCart = useCartStore((state) => state.addItem);
  const cart = useCartStore((state) => state.cart);
  const { success, error: showError } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? `Error loading product: ${error.message}` : 'Product not found'}
          </AlertDescription>
        </Alert>
        <Link href="/shop">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const stockQuantity = product.stock?.quantity || 0;
  const isInStock = stockQuantity > 0;

  // Calculate how many of this product are already in cart
  const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  const inCartQuantity = cart?.items?.find((item: any) => item.product_id === productId)?.quantity || 0;

  // Available stock = total stock - already in cart
  const availableStock = Math.max(0, stockQuantity - inCartQuantity);
  const maxQuantity = Math.max(1, availableStock);
  const canAddToCart = availableStock > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    // Validate quantity against available stock (after considering cart)
    if (!canAddToCart) {
      showError('This product is already in your cart with maximum available quantity');
      return;
    }

    if (quantity > availableStock) {
      showError(`Only ${availableStock} units available (${inCartQuantity} already in cart)`);
      setQuantity(Math.min(quantity, availableStock));
      return;
    }

    setIsAddingToCart(true);
    try {
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      await addToCart(productId, quantity);
      success(`${quantity} item(s) of ${product.name} added to cart!`);
      setQuantity(1);
    } catch (err) {
      showError('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Jualin!`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Product link copied to clipboard!');
  };

  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is between 1 and stock quantity
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square group">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No Image Available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <WishlistButton
                item={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: 'product',
                }}
                variant="minimal"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="py-6 border-y border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Stock</p>
                {isInStock ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-lg">
                    {stockQuantity} units
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-lg mb-2">About this product</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Quantity:</span>
              <div className="flex items-center gap-2 border-2 rounded-lg p-1">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!isInStock || quantity >= maxQuantity}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAddingToCart || quantity > availableStock}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-primary-foreground rounded-lg transition flex items-center justify-center shadow-lg hover:shadow-xl shadow-primary/20"
                title="Add to Cart"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex-1 h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition flex items-center justify-center"
                title="Share Product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <ProductReview productId={id} />
      </div>

      <div>
        <RecommendationsCarousel productId={id} />
      </div>
    </div >
  );
}
