'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Jualin</h3>
            <p className="text-sm text-gray-400">
              Platform e-commerce SaaS untuk memudahkan penjual dalam mengelola toko online mereka.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Products
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <p>
                Email:{' '}
                <a href="mailto:info@jualin.com" className="hover:text-white transition">
                  info@jualin.com
                </a>
              </p>
              <p>Phone: +62 (123) 456-7890</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-white transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Jualin. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>
              <Link href="/sitemap" className="hover:text-white transition">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
