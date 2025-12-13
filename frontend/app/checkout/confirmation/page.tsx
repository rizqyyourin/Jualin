'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Download, Home, Loader2, Clock, Package, Truck } from 'lucide-react';
import apiClient from '@/lib/api';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_price: number;
  items: Array<{
    id: number;
    product?: {
      name: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  shipping_address: {
    recipient_name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
  };
  created_at: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    } else {
      // Fallback to localStorage for old orders
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        const parsedOrder = JSON.parse(lastOrder);
        // Convert old format to new format
        setOrder({
          id: 0,
          order_number: parsedOrder.orderNumber,
          status: 'confirmed',
          payment_status: 'pending',
          payment_method: parsedOrder.paymentMethod || 'N/A',
          total_price: parsedOrder.total,
          items: parsedOrder.items || [],
          shipping_address: parsedOrder.shippingData || {},
          created_at: parsedOrder.date || new Date().toISOString(),
        });
      }
      setIsLoading(false);
    }
  }, [orderNumber]);

  const fetchOrder = async (orderNum: string) => {
    setIsLoading(true);
    try {
      // First get all orders, then find by order number
      const response = await apiClient.get('/orders');
      // Response is paginated, data is in response.data.data.data
      const ordersData = response.data.data?.data || response.data.data || [];
      const orders = Array.isArray(ordersData) ? ordersData : [];
      const foundOrder = orders.find((o: Order) => o.order_number === orderNum);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; icon: any; color: string }> = {
      pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
      confirmed: { label: 'Order Confirmed', icon: CheckCircle, color: 'text-green-600' },
      processing: { label: 'Processing', icon: Package, color: 'text-purple-600' },
      shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-600' },
      delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
      cancelled: { label: 'Cancelled', icon: CheckCircle, color: 'text-red-600' },
    };
    return statusMap[status] || statusMap.confirmed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed and will
            be processed shortly.
          </p>
          <p className="text-lg font-semibold text-primary">
            Order #: {order.order_number}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Order Information</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Total</p>
                  <p className="font-bold text-2xl text-primary">
                    ${Number(order.total_price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  📧 A confirmation email has been sent to{' '}
                  <span className="font-semibold">
                    {order.shipping_address?.recipient_name || 'your email'}
                  </span>
                </p>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${Number(item.total_price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${Number(item.unit_price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>

              <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-lg">
                  {order.shipping_address?.recipient_name}
                </p>
                <p>{order.shipping_address?.address}</p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.province}{' '}
                  {order.shipping_address?.postal_code}
                </p>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Phone: {order.shipping_address?.phone}
                  </p>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6 sm:p-8 bg-green-50 border border-green-200">
              <h3 className="font-bold text-lg text-green-900 mb-4">
                What's Next?
              </h3>
              <ul className="space-y-3 text-green-900">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">1</span>
                  <span>
                    Check your email for an order confirmation with tracking
                    details
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">2</span>
                  <span>
                    Your order will be prepared and shipped within 1-2 business
                    days
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">3</span>
                  <span>
                    You'll receive a tracking number via email once your order
                    ships
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div>
            <Card className="p-6 sticky top-20 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Order Status</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${order.status === 'confirmed' ? statusInfo.color : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'confirmed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-semibold">
                      Order Confirmed
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'processing' ? statusInfo.color : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'processing' ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm ${order.status === 'processing' ? 'font-semibold' : 'text-gray-500'}`}>Processing</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'shipped' ? statusInfo.color : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm ${order.status === 'shipped' ? 'font-semibold' : 'text-gray-500'}`}>Shipped</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'delivered' ? statusInfo.color : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={`text-sm ${order.status === 'delivered' ? 'font-semibold' : 'text-gray-500'}`}>Delivered</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <button
                  onClick={handlePrintOrder}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Print Order
                </button>

                <Link href="/orders">
                  <Button className="w-full mb-4">View Order History</Button>
                </Link>

                <Link href="/shop">
                  <Button variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
