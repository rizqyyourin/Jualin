'use client';

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
} from 'lucide-react';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+62 812-3456-7890',
  address: '123 Street, City, Country',
  joinDate: '2023-06-15',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  orderCount: 12,
  favoriteCount: 8,
  verified: true,
};

const stats = [
  {
    icon: ShoppingBag,
    label: 'Total Orders',
    value: mockUser.orderCount,
    href: '/orders',
  },
  {
    icon: Heart,
    label: 'Favorites',
    value: mockUser.favoriteCount,
    href: '/favorites',
  },
];

const menuItems = [
  {
    icon: User,
    label: 'Edit Profile',
    href: '/profile/edit',
  },
  {
    icon: Settings,
    label: 'Account Settings',
    href: '/settings',
  },
];

export default function ProfilePage() {
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
              src={mockUser.avatar}
              alt={mockUser.name}
              className="w-32 h-32 rounded-full border-4 border-primary shadow-lg"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{mockUser.name}</h2>
                {mockUser.verified && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600">Member since {new Date(mockUser.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">{mockUser.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-semibold">{mockUser.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900 font-semibold">{mockUser.address}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/profile/edit" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Edit Profile
                </Button>
              </Link>

              <Link href="/settings" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary/5">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => {
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

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
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

          <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-red-50 transition text-left group border-t pt-4">
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

      {/* Security Section */}
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Account Security</h3>
        <p className="text-gray-700 mb-4">
          Keep your account secure by regularly updating your password and reviewing login activity.
        </p>
        <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
          Change Password
        </Button>
      </Card>
    </div>
  );
}
