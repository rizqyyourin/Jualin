'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { useUserStore } from '@/lib/stores/userStore';
import { useNotifications } from '@/lib/stores/notificationStore';
import apiClient from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: userLoading } = useUserStore();
  const { success, error: showError } = useNotifications();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Protect route
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, userLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        province: (user as any).province || '',
        postal_code: (user as any).postal_code || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSaved(false);

    try {
      await apiClient.put('/user/profile', formData);
      setSaved(true);
      success('Profile updated successfully!');
      setTimeout(() => {
        setSaved(false);
        router.push('/profile');
      }, 2000);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to save profile. Please try again.');
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Button */}
      <Link href="/profile" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-semibold transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your personal information</p>
      </div>

      {/* Form Card */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {saved && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Profile saved successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-5">
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                disabled={isLoading}
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                required
                autoComplete="email"
                disabled={isLoading}
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                autoComplete="tel"
                disabled={isLoading}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Address</h2>
            <div className="space-y-5">
              <FormInput
                label="Street Address"
                name="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={errors.address}
                autoComplete="street-address"
                disabled={isLoading}
                placeholder="123 Main Street"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="City"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                  autoComplete="address-level2"
                  disabled={isLoading}
                  placeholder="New York"
                />

                <FormInput
                  label="Province/State"
                  name="province"
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  error={errors.province}
                  autoComplete="address-level1"
                  disabled={isLoading}
                  placeholder="NY"
                />
              </div>

              <FormInput
                label="Postal Code"
                name="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                error={errors.postal_code}
                autoComplete="postal-code"
                disabled={isLoading}
                placeholder="10001"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Link href="/profile">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
