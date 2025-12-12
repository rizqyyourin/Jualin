'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo & Home Link */}
        <div className="text-center mb-12">
          {showBackButton && (
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          )}

          <Link href="/" className="inline-block mb-6">
            <div className="text-4xl font-bold text-blue-600">Jualin</div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
