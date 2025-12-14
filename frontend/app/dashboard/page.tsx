'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Plus,
    Settings,
    ShoppingBag,
    BarChart3,
    TrendingUp,
    Users,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/lib/stores/userStore';
import apiClient from '@/lib/api';

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_price: number;
    created_at: string;
    customer?: {
        name: string;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: userLoading } = useUserStore();
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Protect route
    useEffect(() => {
        if (!userLoading && !isAuthenticated) {
            router.push('/');
        } else if (!userLoading && isAuthenticated && user?.role !== 'merchant') {
            router.push('/');
        }
    }, [isAuthenticated, userLoading, user, router]);

    // Fetch dashboard data
    useEffect(() => {
        if (isAuthenticated && user?.role === 'merchant') {
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch products
            const productsResponse = await apiClient.get('/products');
            const products = productsResponse.data.data || [];

            // Fetch orders
            const ordersResponse = await apiClient.get('/orders');
            const ordersData = ordersResponse.data.data?.data || ordersResponse.data.data || [];
            const orders = Array.isArray(ordersData) ? ordersData : [];

            // Calculate stats
            const totalRevenue = orders.reduce((sum: number, order: Order) => {
                return sum + Number(order.total_price || 0);
            }, 0);

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue: totalRevenue,
                recentOrders: orders.filter((o: Order) => o.status === 'confirmed' || o.status === 'processing').length
            });

            // Get recent 5 orders
            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
            processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
            shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    if (userLoading || !isAuthenticated || user?.role !== 'merchant') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seller Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/products/create">
                            <Button className="gap-2">
                                <Plus size={16} />
                                Add Product
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        From {stats.totalOrders} orders
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
                                    <Package className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Listed products
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        All time orders
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
                                    <Users className="h-4 w-4 text-amber-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.recentOrders}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Need attention
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions & Recent */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Links */}
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Management</CardTitle>
                                    <CardDescription>Quick access to manage your store</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Link href="/dashboard/products" className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Products</div>
                                                <div className="text-xs text-gray-500">Manage inventory</div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </Link>

                                    <Link href="/dashboard/orders" className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Orders</div>
                                                <div className="text-xs text-gray-500">Process incoming orders</div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </Link>

                                    <Link href="/dashboard/settings" className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                                <Settings size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Settings</div>
                                                <div className="text-xs text-gray-500">Store configuration</div>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Recent Orders */}
                            <Card className="col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                    <CardDescription>Latest transactions from your customers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentOrders.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                            <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                                            <p className="font-medium">No recent orders</p>
                                            <p className="text-sm mt-1">When you make sales, they will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentOrders.map((order) => (
                                                <Link
                                                    key={order.id}
                                                    href="/dashboard/orders"
                                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="font-semibold text-gray-900">
                                                                #{order.order_number}
                                                            </p>
                                                            {getStatusBadge(order.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {order.customer?.name || 'Customer'} •{' '}
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary">
                                                            ${Number(order.total_price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link href="/dashboard/orders">
                                                <Button variant="outline" className="w-full mt-4">
                                                    View All Orders
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
