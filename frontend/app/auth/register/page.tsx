'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to home page
    router.push('/');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Jualin and start selling today" showBackButton>
      <div className="space-y-6">
        <SignupForm onSuccess={handleSuccess} />

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
