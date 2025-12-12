'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cartStore';
import { ChevronRight, Edit2 } from 'lucide-react';

interface ShippingData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function ReviewPage() {
  const { getTotalPrice, cart } = useCartStore();
  const items = cart?.items || [];
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const shipping = localStorage.getItem('shippingData');
    const payment = localStorage.getItem('paymentMethod');
    const method = localStorage.getItem('shippingMethod');

    if (shipping) setShippingData(JSON.parse(shipping));
    if (payment) setPaymentMethod(payment);
    if (method) setShippingMethod(method);

    setIsLoading(false);
  }, [isMounted]);

  const subtotal = getTotalPrice();
  const shippingMethods: Record<string, number> = {
    standard: 10,
    express: 25,
    overnight: 50,
  };
  const shippingCost = subtotal > 100 ? 0 : (shippingMethods[shippingMethod] || 10);
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const steps = [
    { number: 1, label: 'Shipping', completed: true, current: false },
    { number: 2, label: 'Payment', completed: true, current: false },
    { number: 3, label: 'Review', completed: false, current: true },
    { number: 4, label: 'Confirmation', completed: false, current: false },
  ];

  const getPaymentMethodLabel = () => {
    const methods: Record<string, string> = {
      card: 'Credit or Debit Card',
      paypal: 'PayPal',
      applepay: 'Apple Pay',
      googlepay: 'Google Pay',
    };
    return methods[paymentMethod] || 'Not selected';
  };

  const getShippingMethodLabel = () => {
    const methods: Record<string, string> = {
      standard: 'Standard Shipping (5-7 business days)',
      express: 'Express Shipping (2-3 business days)',
      overnight: 'Overnight Shipping (next business day)',
    };
    return methods[shippingMethod] || 'Standard Shipping';
  };

  const handleSubmitOrder = () => {
    // Store order data
    const orderData = {
      orderNumber: `ORD-${Date.now()}`,
      shippingData,
      paymentMethod,
      shippingMethod,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      date: new Date().toISOString(),
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    localStorage.setItem('recentOrders', JSON.stringify([orderData]));
    localStorage.removeItem('shippingData');
    localStorage.removeItem('shippingMethod');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('cardData');

    // Navigate to confirmation
    window.location.href = '/checkout/confirmation';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress */}
        <CheckoutProgress steps={steps} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Items</h2>
                <Link
                  href="/cart"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <Link
                  href="/checkout/shipping"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
              </div>

              {shippingData && (
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">{shippingData.fullName}</p>
                  <p>{shippingData.address}</p>
                  <p>
                    {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                  </p>
                  <p>{shippingData.country}</p>
                  <p className="text-sm text-gray-600">{shippingData.email}</p>
                  <p className="text-sm text-gray-600">{shippingData.phone}</p>
                </div>
              )}
            </Card>

            {/* Shipping & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-3">Shipping Method</h3>
                <p className="text-gray-700">{getShippingMethodLabel()}</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-3">Payment Method</h3>
                <p className="text-gray-700">{getPaymentMethodLabel()}</p>
              </Card>
            </div>
          </div>

          {/* Order Summary & Submit */}
          <div>
            <Card className="p-6 sticky top-20 space-y-6">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {subtotal > 100 ? 'Shipping (Free)' : 'Shipping'}
                  </span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  By placing this order, you agree to our Terms of Service and
                  Privacy Policy.
                </p>
              </div>

              <button
                onClick={handleSubmitOrder}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Place Order
                <ChevronRight className="w-4 h-4" />
              </button>

              <Link href="/checkout/payment" className="block">
                <Button variant="outline" className="w-full">
                  Back to Payment
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
