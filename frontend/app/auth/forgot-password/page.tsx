'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link"
        showBackButton={false}
      >
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Password reset link sent to <strong>{email}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-center text-gray-600">
            <p>Check your email for a link to reset your password.</p>
            <p className="text-sm">
              If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Try Another Email
            </Button>

            <Link href="/auth/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
      showBackButton
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Message */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Enter the email address associated with your account. We'll send you a link to
            reset your password.
          </AlertDescription>
        </Alert>

        {/* Email Field */}
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-auto text-base"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
