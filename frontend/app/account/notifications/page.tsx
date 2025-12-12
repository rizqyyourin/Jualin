'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, MessageSquare, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newArrivals: false,
    reviews: true,
    security: true,
    newsletter: false,
    sms: false,
    push: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const notificationSettings = [
    {
      category: 'Pesanan & Pengiriman',
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      items: [
        {
          key: 'orderUpdates',
          label: 'Update Pesanan',
          description: 'Menerima notifikasi tentang status pesanan Anda',
        },
      ],
    },
    {
      category: 'Promosi & Penawaran',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      items: [
        {
          key: 'promotions',
          label: 'Promo Spesial',
          description: 'Dapatkan notifikasi tentang diskon dan penawaran khusus',
        },
        {
          key: 'newArrivals',
          label: 'Produk Baru',
          description: 'Beri tahu saya tentang produk baru yang relevan',
        },
      ],
    },
    {
      category: 'Interaksi & Ulasan',
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      items: [
        {
          key: 'reviews',
          label: 'Ulasan Produk',
          description: 'Notifikasi ketika ada ulasan baru untuk produk favorit',
        },
      ],
    },
    {
      category: 'Keamanan Akun',
      icon: <Bell className="w-5 h-5 text-red-600" />,
      items: [
        {
          key: 'security',
          label: 'Alert Keamanan',
          description: 'Notifikasi penting tentang keamanan dan akses akun',
        },
      ],
    },
    {
      category: 'Saluran Komunikasi',
      icon: <Mail className="w-5 h-5 text-indigo-600" />,
      items: [
        {
          key: 'newsletter',
          label: 'Newsletter Email',
          description: 'Terima email bulanan dengan tips dan berita terbaru',
        },
        {
          key: 'sms',
          label: 'SMS Notification',
          description: 'Dapatkan notifikasi penting melalui SMS (mungkin ada biaya)',
        },
        {
          key: 'push',
          label: 'Push Notification',
          description: 'Notifikasi real-time di browser Anda',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Akun
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Notifikasi</h1>
          <p className="text-gray-600">
            Atur preferensi notifikasi Anda untuk berbagai aktivitas
          </p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">✓ Pengaturan berhasil disimpan</p>
          </div>
        )}

        <div className="space-y-6">
          {notificationSettings.map((section, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                {section.icon}
                <h2 className="text-lg font-bold text-gray-900">{section.category}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(item.key as keyof typeof notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notifications[item.key as keyof typeof notifications]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Simpan Pengaturan
          </Button>
          <Link href="/account" className="flex-1">
            <Button variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi Penting</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Notifikasi keamanan akan selalu dikirim terlepas dari pengaturan Anda</li>
            <li>• Anda dapat mengubah pengaturan ini kapan saja</li>
            <li>• Email notifikasi mungkin masuk ke folder spam, periksa secara berkala</li>
            <li>• SMS hanya tersedia di region tertentu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
