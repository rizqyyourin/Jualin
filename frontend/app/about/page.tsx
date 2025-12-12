'use client';

import { ArrowRight, CheckCircle, Users, Zap, Shield, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const features = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'Platform E-commerce Modern',
      description: 'Teknologi terkini dengan Next.js 16 dan React 19 untuk performa optimal'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Mudah Digunakan',
      description: 'Interface yang intuitif dan responsif untuk merchant dan customer'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Aman & Terpercaya',
      description: 'Sistem keamanan berlapis dengan autentikasi dan enkripsi data'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Analytics & Insights',
      description: 'Dapatkan data penjualan real-time dan insight untuk mengembangkan bisnis'
    }
  ];

  const stats = [
    { number: '100K+', label: 'Produk' },
    { number: '50K+', label: 'Penjual' },
    { number: '1M+', label: 'Pembeli' },
    { number: '99%', label: 'Uptime' }
  ];

  const technologies = [
    'Next.js 16.0.8',
    'React 19.2.1',
    'TypeScript 5',
    'TailwindCSS 4',
    'shadcn/ui',
    'Zustand',
    'Axios'
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary font-semibold text-sm">Tentang Jualin</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Platform E-Commerce SaaS Terdepan
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Jualin adalah solusi e-commerce modern yang memberdayakan penjual untuk membangun dan mengelola toko online mereka dengan mudah. Dengan teknologi terkini dan fitur-fitur komprehensif, kami membantu bisnis Anda berkembang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Statistik Platform
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Keunggulan Jualin
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Misi Kami
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Visi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Menjadi platform e-commerce terdepan yang memberdayakan pengusaha kecil dan menengah untuk mencapai kesuksesan digital dengan solusi teknologi yang terjangkau dan mudah digunakan.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Misi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Menyediakan platform e-commerce yang aman, cepat, dan user-friendly untuk membantu penjual mengelola bisnis online mereka dengan efisien serta memberikan pengalaman berbelanja terbaik bagi pelanggan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Teknologi yang Kami Gunakan
          </h2>
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition">
                  <span className="text-gray-900 font-semibold">
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            Kami menggunakan teknologi terkini untuk memastikan performa optimal, keamanan tinggi, dan skalabilitas platform.
          </p>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fitur Unggulan
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Katalog Produk Lengkap</h3>
                  <p className="text-gray-600 text-sm">Kelola ribuan produk dengan sistem kategori yang terorganisir</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Sistem Pembayaran Lengkap</h3>
                  <p className="text-gray-600 text-sm">Dukung berbagai metode pembayaran (Kartu Kredit, PayPal, Apple Pay, Google Pay)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manajemen Pesanan</h3>
                  <p className="text-gray-600 text-sm">Tracking pesanan real-time dan manajemen order yang efisien</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Wishlist & Favorit</h3>
                  <p className="text-gray-600 text-sm">Pelanggan dapat menyimpan produk favorit mereka</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Sistem Review & Rating</h3>
                  <p className="text-gray-600 text-sm">Pelanggan dapat memberikan ulasan dan rating untuk produk</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Filter & Pencarian Lanjutan</h3>
                  <p className="text-gray-600 text-sm">Fitur pencarian, filter kategori, harga, dan stok produk</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manajemen Profil</h3>
                  <p className="text-gray-600 text-sm">Edit profil, pengaturan akun, dan keamanan data</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Notifikasi Real-time</h3>
                  <p className="text-gray-600 text-sm">Dapatkan pemberitahuan untuk pesanan dan aktivitas penting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Siap untuk Memulai?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Bergabunglah dengan ribuan penjual dan pembeli yang sudah mempercayai Jualin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-primary hover:bg-primary/5">
                Daftar sebagai Penjual
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Jelajahi Belanja Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Hubungi Kami
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Website</h3>
              <p className="text-gray-600">www.jualin.com</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">support@jualin.com</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Customer Service</h3>
              <p className="text-gray-600">+62 (0) 800-XXX-XXXX</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Import the ShoppingCart icon from lucide-react
import { ShoppingCart } from 'lucide-react';
