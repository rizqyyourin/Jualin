'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/lib/stores/userStore';
import {
  User,
  Mail,
  MapPin,
  Phone,
  LogOut,
  Settings,
  ShoppingBag,
  Heart,
  Lock,
  Bell,
  ChevronRight,
  Edit2,
} from 'lucide-react';

// Mock user data (fallback)
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+62 812-3456-7890',
  address: '123 Street, City, Country',
  joinDate: '2023-06-15',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  verified: true,
};

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Diperlukan</h1>
          <p className="text-gray-600 mb-6">
            Silakan login atau daftar untuk mengakses akun Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </Link>
            <Link href="/auth/register" className="flex-1">
              <Button variant="outline" className="w-full">
                Daftar
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const displayUser = user || mockUser;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Akun Saya</h1>
          <p className="text-gray-600">Kelola profil dan pengaturan akun Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="text-center mb-6">
                <img
                  src={displayUser?.avatar || mockUser.avatar}
                  alt={displayUser?.name || mockUser.name}
                  className="w-24 h-24 rounded-full border-4 border-blue-600 mx-auto mb-4 shadow-lg"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{displayUser?.name || mockUser.name}</h2>
                  {(displayUser?.email || mockUser.email) && (
                    <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Terverifikasi
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="break-all">{displayUser?.email || mockUser.email}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Bergabung</p>
                  <p>
                    {displayUser?.created_at
                      ? new Date(displayUser.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : new Date(mockUser.joinDate).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                  </p>
                </div>
              </div>

              <Link href="/profile/edit">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profil
                </Button>
              </Link>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/orders">
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <ShoppingBag className="w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-sm text-gray-600">Total Pesanan</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </Card>
              </Link>
              <Link href="/wishlist">
                <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                  <Heart className="w-8 h-8 text-red-600 mb-3" />
                  <p className="text-sm text-gray-600">Favorit</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </Card>
              </Link>
            </div>

            {/* Account Settings Menu */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pengaturan Akun</h3>
              <div className="space-y-2">
                <Link href="/profile/edit">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Profil Saya</p>
                        <p className="text-sm text-gray-600">Ubah informasi pribadi Anda</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>

                <Link href="/settings">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Pengaturan</p>
                        <p className="text-sm text-gray-600">Kelola preferensi dan privasi</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>

                <Link href="/account/password">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Ubah Password</p>
                        <p className="text-sm text-gray-600">Perbarui password akun Anda</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>

                <Link href="/account/notifications">
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Notifikasi</p>
                        <p className="text-sm text-gray-600">Atur preferensi notifikasi Anda</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">{displayUser?.email || mockUser.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Nomor Telepon</p>
                    <p className="text-gray-600">{displayUser?.phone || mockUser.phone}</p>
                  </div>
                </div>
                {(displayUser?.phone || mockUser.address) && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Alamat</p>
                      <p className="text-gray-600">{mockUser.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Edit Informasi
                </Button>
              </Link>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-xl font-bold text-red-900 mb-4">Zone Berbahaya</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-100"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-100"
                >
                  Hapus Akun
                </Button>
              </div>
              <p className="text-sm text-red-700 mt-4">
                ⚠️ Tindakan di zona ini tidak dapat dibatalkan. Lakukan dengan hati-hati.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
