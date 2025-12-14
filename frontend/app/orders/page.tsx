'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ChevronRight, MapPin, Calendar, Clock, CheckCircle, Package, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_price: number;
  shipping_address: {
    full_name?: string;
    city?: string;
    state?: string;
  };
  items: Array<{
    id: number;
    product?: {
      name: string;
    };
    quantity: number;
    unit_price: number;
  }>;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data.data.data || response.data.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string; description: string }> = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        label: 'Pending Confirmation',
        description: 'Waiting for seller to confirm your order'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed',
        description: 'Seller confirmed your order'
      },
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Package,
        label: 'Completed',
        description: 'Order has been completed'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Clock,
        label: 'Cancelled',
        description: 'Order was cancelled'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return {
      badge: (
        <Badge className={`${config.color} border flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      ),
      description: config.description
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            View and track all your orders
          </p>
        </div>

        {orders.length === 0 ? (
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
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <Card key={order.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Order #{order.order_number}
                      </h3>
                      <div className="flex flex-col gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{orderDate}</span>
                        </div>
                        {order.shipping_address?.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {order.shipping_address.city}, {order.shipping_address.state}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Total */}
                    <div className="flex flex-col sm:items-end gap-3">
                      {statusInfo.badge}
                      <p className="text-2xl font-bold text-primary">
                        ${Number(order.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status Description */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Status:</strong> {statusInfo.description}
                    </p>
                  </div>

                  {/* Order Items Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {item.product?.name || 'Product'} x {item.quantity}
                          </span>
                          <span className="font-semibold">
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 pt-2 border-t">
                          +{order.items.length - 3} more item
                          {order.items.length - 3 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* View Order Button */}
                  <div className="flex gap-2">
                    <Link href={`/orders/${order.id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 px-4 rounded-lg transition">
                        View Order Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </Card>
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
