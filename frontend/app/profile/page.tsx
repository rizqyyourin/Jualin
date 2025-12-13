'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useUserStore } from '@/lib/stores/userStore';
import apiClient from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: userLoading, logout } = useUserStore();
  const [stats, setStats] = useState({
    orderCount: 0,
    wishlistCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, userLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch orders count
      const ordersResponse = await apiClient.get('/orders');
      const ordersData = ordersResponse.data.data?.data || ordersResponse.data.data || [];
      const orders = Array.isArray(ordersData) ? ordersData : [];

      // Fetch wishlist count
      const wishlistResponse = await apiClient.get('/wishlist');
      const wishlist = wishlistResponse.data.data || [];

      setStats({
        orderCount: orders.length,
        wishlistCount: wishlist.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (userLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsData = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.orderCount,
      href: '/orders',
    },
    {
      icon: Heart,
      label: 'Wishlist Items',
      value: stats.wishlistCount,
      href: '/wishlist',
    },
  ];

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      href: user?.role === 'merchant' ? '/dashboard/settings' : '/profile/edit',
    },
  ];

  // Add dashboard link for merchants
  if (user?.role === 'merchant') {
    menuItems.unshift({
      icon: ShoppingBag,
      label: 'Seller Dashboard',
      href: '/dashboard',
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Avatar */}
          <div>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="w-32 h-32 rounded-full border-4 border-primary shadow-lg"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                {user?.email_verified_at && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </span>
                )}
                {user?.role === 'merchant' && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    Seller
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
              </p>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-semibold">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              {user?.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900 font-semibold">
                      {user.address}
                      {user.city && `, ${user.city}`}
                      {user.province && `, ${user.province}`}
                      {user.postal_code && ` ${user.postal_code}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={user?.role === 'merchant' ? '/dashboard/settings' : '/profile/edit'} className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Edit Profile
                </Button>
              </Link>

              <Link href={user?.role === 'merchant' ? '/dashboard' : '/orders'} className="flex-1">
                <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary/5">
                  {user?.role === 'merchant' ? 'Dashboard' : 'My Orders'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.href} href={stat.href}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition text-left group">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-gray-900 font-semibold group-hover:text-primary transition">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                </button>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-red-50 transition text-left group border-t pt-4"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="text-red-600 font-semibold group-hover:text-red-700 transition">
                Logout
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition" />
          </button>
        </div>
      </Card>
    </div>
  );
}
