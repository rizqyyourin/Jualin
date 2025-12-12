'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CartItemComponent } from '@/components/cart/CartItem';
import { useCartStore } from '@/lib/stores/cartStore';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function CartPage() {
  const { cart, loadCart, removeItem, updateQuantity, loading, getTotalPrice, getTotalItems } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  if (loading && !cart) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shipping = Number(cart?.shipping || 0);
  const tax = Number(cart?.tax || 0);
  const total = Number(cart?.total || 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to get started!</p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/products" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600">
          You have <span className="font-semibold">{itemCount}</span> {itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="divide-y">
              {items.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={{
                    id: item.id.toString(), // Convert number to string for component compatibility
                    name: item.product?.name || 'Unknown Product',
                    price: Number(item.price),
                    quantity: item.quantity,
                    image: '', // API needs to return image, currently missing in type definition but let's handle gracefully
                  }}
                  onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-20 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

            {/* Breakdown */}
            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {shipping > 0 ? (
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-orange-600 font-semibold">${shipping.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>

            {/* Info */}
            {subtotal > 0 && subtotal <= 100 && (
              <div className="bg-primary/5 p-3 rounded-lg text-sm text-primary">
                <p className="font-semibold mb-1">Free Shipping</p>
                <p>Add ${(100 - subtotal).toFixed(2)} more for free shipping!</p>
              </div>
            )}

            {/* Checkout Button */}
            <Link href="/checkout/shipping" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 h-auto text-base">
                Proceed to Checkout
              </Button>
            </Link>

            {/* Continue Shopping */}
            <Link href="/products">
              <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 h-auto text-base">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
