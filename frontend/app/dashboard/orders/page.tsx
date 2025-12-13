'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { orderAPI } from '@/lib/api/orders';
import { Loader2, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '@/lib/stores/notificationStore';
import apiClient from '@/lib/api';

interface Order {
    id: number;
    order_number: string;
    customer?: {
        name: string;
        email: string;
    };
    items: Array<{
        id: number;
        product?: {
            name: string;
        };
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
    status: string;
    payment_status: string;
    payment_method: string;
    total_price: number;
    shipping_address: any;
    created_at: string;
}

export default function DashboardOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { success, error: showError } = useNotifications();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderAPI.getOrders();
            setOrders(response.data.data || []);
        } catch (err) {
            showError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, {
                status: newStatus,
                notes: `Status updated to ${newStatus}`,
            });
            success('Order status updated successfully');
            loadOrders();
            setSelectedOrder(null);
        } catch (err) {
            showError('Failed to update order status');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
            shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-600 mt-1">Manage incoming orders for your products</p>
            </div>

            {orders.length === 0 ? (
                <Card className="p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders for your products will appear here</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Order #{order.order_number}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Customer</p>
                                        <p className="font-semibold">{order.customer?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Method</p>
                                        <p className="font-semibold capitalize">
                                            {order.payment_method?.replace('_', ' ') || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Amount</p>
                                        <p className="font-bold text-primary text-lg">
                                            ${Number(order.total_price).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Items</p>
                                        <p className="font-semibold">{order.items.length} item(s)</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="border-t pt-3">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Order Items:</p>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-700">
                                                    {item.product?.name || 'Product'} x {item.quantity}
                                                </span>
                                                <span className="font-semibold">
                                                    ${Number(item.total_price).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    View Details
                                </Button>

                                {order.status === 'confirmed' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'processing')}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        Start Processing
                                    </Button>
                                )}

                                {order.status === 'processing' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Mark as Shipped
                                    </Button>
                                )}

                                {order.status === 'shipped' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Mark as Delivered
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <Card
                        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                                <p className="text-gray-600">
                                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Shipping Address */}
                        <div className="mb-4">
                            <h3 className="font-bold mb-2">Shipping Address</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p className="font-semibold">
                                    {selectedOrder.shipping_address?.recipient_name}
                                </p>
                                <p>{selectedOrder.shipping_address?.phone}</p>
                                <p>{selectedOrder.shipping_address?.address}</p>
                                <p>
                                    {selectedOrder.shipping_address?.city},{' '}
                                    {selectedOrder.shipping_address?.province}{' '}
                                    {selectedOrder.shipping_address?.postal_code}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-4">
                            <h3 className="font-bold mb-2">Order Items</h3>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-semibold">{item.product?.name}</p>
                                            <p className="text-sm text-gray-600">
                                                ${Number(item.unit_price).toFixed(2)} x {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold">${Number(item.total_price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${Number(selectedOrder.total_price).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={() => setSelectedOrder(null)}
                            variant="outline"
                            className="w-full mt-4"
                        >
                            Close
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
