'use client';

import Marquee from '@/components/ui/marquee';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, TrendingUp, Users, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';

// Mock featured products for the landing page
const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 199.99,
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    price: 299.99,
    category: 'Electronics',
    rating: 4.8,
    reviews: 256,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  },
  {
    id: '4',
    name: 'Minimalist Coffee Maker',
    price: 79.99,
    category: 'Home',
    rating: 4.6,
    reviews: 342,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
  },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-52 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">


            <h1 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tighter leading-[0.9] animate-fade-in-up delay-100">
              THE PREMIER <br />
              <span className="text-primary italic">E-COMMERCE</span> HUB.
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              The ultimate destination for online shopping and selling.
              Discover curated minimalist products on Jualin, the trusted global marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up delay-300">
              <Link
                href="/shop"
                className="bg-gray-900 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Start Shopping Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-70 mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl opacity-70 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-white via-white to-transparent"></div>
        </div>
      </section>

      {/* Trusted By Strip */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12 overflow-hidden">
        <div className="container mx-auto px-4 mb-6 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Trusted by 50,000+ Sellers</p>
        </div>
        <Marquee className="[--duration:30s] [--gap:4rem] opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Logos placeholders using text for speed/performance, normally would be SVG images */}
          <span className="text-2xl font-bold font-serif mx-8">VOGUE</span>
          <span className="text-2xl font-black font-sans mx-8 tracking-tighter">HYPEBEAST</span>
          <span className="text-2xl font-bold font-mono mx-8">GQ</span>
          <span className="text-2xl font-black font-serif italic mx-8">FORBES</span>
          <span className="text-2xl font-bold font-sans mx-8">WIRED</span>
          <span className="text-2xl font-black font-mono mx-8">TechCrunch</span>
        </Marquee>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Weekly Curated</h2>
            <p className="text-gray-500 text-lg">Hand-picked selection updated every Monday.</p>
          </div>
          <Link href="/shop" className="text-gray-900 font-bold text-lg hover:text-primary border-b-2 border-gray-900 hover:border-primary transition-colors pb-1 flex items-center gap-2 group">
            View All Collection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              className="border-none shadow-none bg-transparent group"
            // Pass custom styles to ProductCard via className if supported, or rely on global changes
            />
          ))}
        </div>
      </section>

      {/* Editorial Features Section */}
      <section className="py-32 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Everything you need <br />
              <span className="text-primary">to scale your store.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Modern Checkout</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Optimized for speed and conversion.
                    Seamless payment processing.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Track your sales, visitors, and growth
                    in one beautiful dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                  <Users className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Customer Profiles</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Understand your consumers with
                    detailed purchase history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-500">
            Join the community of modern sellers today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="bg-primary text-white px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Jualin',
            url: 'https://jualin.com',
            description: 'The premium marketplace for curated minimalist products.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://jualin.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  );
}
