'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';
import { MessageAlert } from '@/components/auth/MessageAlert';
import { useUserStore } from '@/lib/stores/userStore';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  isModal?: boolean; // True when used in modal, false when full page
}

export function LoginForm({ onSuccess, onSwitchToSignup, isModal = true }: LoginFormProps) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage - backend returns data.data.access_token
      const userData = data.data || data;
      if (userData.access_token) {
        localStorage.setItem('authToken', userData.access_token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        // Update Zustand store
        setUser(userData.user);
      }

      // Reset form
      setEmail('');
      setPassword('');
      setErrors({});

      onSuccess?.();
      // Only redirect if used as full page, not modal
      if (!isModal) {
        router.push('/');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <MessageAlert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <FormInput
        name="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="your@email.com"
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>

      <div className="text-center space-y-2">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
          Forgot password?
        </Link>
      </div>

      {onSwitchToSignup && (
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:text-primary/80 font-semibold"
          >
            Sign up
          </button>
        </div>
      )}
    </form>
  );
}
