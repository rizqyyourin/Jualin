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
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/lib/stores/userStore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useUserStore();
    const [stats, setStats] = useState({
        totalProducts: 12,
        totalOrders: 45,
        totalRevenue: 3450.00,
        recentOrders: 5
    });

    // Protect route
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (!isLoading && isAuthenticated && user?.role !== 'merchant') {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== 'merchant') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                                +20.1% from last month
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
                                4 low stock alerts
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
                            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Customer Reviews</CardTitle>
                            <Users className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.8</div>
                            <p className="text-xs text-gray-500 mt-1">
                                Based on 128 reviews
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

                    {/* Recent Activity placeholder based on user request to remove dummy data, keeping it static/clean for now */}
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Latest transactions from your customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="font-medium">No recent orders</p>
                                <p className="text-sm mt-1">When you make sales, they will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
