'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { OrderTrackingCard } from '@/components/orders/OrderTrackingCard';

interface Order {
  orderNumber: string;
  date: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shippingData?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
  };
  status?: 'pending' | 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const recentOrders = localStorage.getItem('recentOrders');
    if (recentOrders) {
      setOrders(JSON.parse(recentOrders));
    }
    setIsLoading(false);
  }, [isMounted]);

  const getOrderStatus = (orderDate: string) => {
    const date = new Date(orderDate);
    const now = new Date();
    const daysAgo = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysAgo === 0) {
      return { status: 'Processing', color: 'bg-primary/10 text-primary' };
    } else if (daysAgo === 1) {
      return { status: 'Shipped', color: 'bg-purple-100 text-purple-800' };
    } else {
      return { status: 'Delivered', color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            View and manage all your orders in one place
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping now!
            </p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </Card>
        ) : (
          /* Orders List */
          <div className="space-y-8">
            {orders.map((order) => {
              const statusInfo = getOrderStatus(order.date);
              const orderDate = new Date(order.date).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }
              );

              // Generate tracking number
              const trackingNumber = `TRACK-${order.orderNumber}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

              // Estimate delivery date (3-5 days from now)
              const estimatedDelivery = new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={order.orderNumber} className="space-y-4">
                  {/* Order Card */}
                  <Card className="p-6 hover:shadow-lg transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      {/* Order Info */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Order {order.orderNumber}
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{orderDate}</span>
                          </div>
                          {order.shippingData && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {order.shippingData.city},{' '}
                                {order.shippingData.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Total */}
                      <div className="flex flex-col sm:items-end gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${statusInfo.color}`}
                        >
                          {statusInfo.status}
                        </span>
                        <p className="text-2xl font-bold text-primary">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Items ({order.items.length})
                      </p>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>{item.name}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500 pt-2 border-t">
                            +{order.items.length - 2} more item
                            {order.items.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* View Order Button */}
                    <Link href="/checkout/confirmation">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 px-4 rounded-lg transition">
                        View Order Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </Card>

                  {/* Order Tracking */}
                  <OrderTrackingCard
                    orderId={order.orderNumber}
                    currentStatus={order.status || statusInfo.status.toLowerCase() as any}
                    estimatedDelivery={estimatedDelivery}
                    trackingNumber={trackingNumber}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
