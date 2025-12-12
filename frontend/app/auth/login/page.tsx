'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to home page
    router.push('/');
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Jualin account" showBackButton>
      <div className="space-y-6">
        <LoginForm isModal={false} onSuccess={handleSuccess} />

        <div className="text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up here
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold">Demo credentials:</span>
          </p>
          <p className="text-xs text-gray-600">
            Email: <code className="bg-gray-100 px-1.5 py-0.5 rounded">demo@jualin.com</code>
          </p>
          <p className="text-xs text-gray-600">
            Password: <code className="bg-gray-100 px-1.5 py-0.5 rounded">password123</code>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
