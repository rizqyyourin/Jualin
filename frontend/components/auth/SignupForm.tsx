'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';
import { MessageAlert } from '@/components/auth/MessageAlert';
import { useUserStore } from '@/lib/stores/userStore';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  isModal?: boolean; // True when used in modal, false when full page
}

export function SignupForm({ onSuccess, onSwitchToLogin, isModal = true }: SignupFormProps) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'merchant',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage - backend returns data.data.access_token
      const userData = data.data || data;
      if (userData.access_token) {
        localStorage.setItem('authToken', userData.access_token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        // Update Zustand store
        setUser(userData.user);
      }

      setMessage({
        type: 'success',
        text: 'Account created successfully! Redirecting...',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
      });
      setErrors({});

      setTimeout(() => {
        onSuccess?.();
        // Only redirect if used as full page, not modal
        if (!isModal) {
          router.push('/shop');
        }
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        name="name"
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
      />

      <FormInput
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="your@email.com"
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
      />

      <FormInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="••••••••"
      />

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="customer">Customer (Buyer)</option>
          <option value="merchant">Merchant (Seller)</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </Button>

      {onSwitchToLogin && (
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary/80 font-semibold"
          >
            Login
          </button>
        </div>
      )}
    </form>
  );
}
