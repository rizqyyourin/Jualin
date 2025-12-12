'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState<FormData>({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812-3456-7890',
    address: '123 Street',
    city: 'Jakarta',
    country: 'Indonesia',
    zipCode: '12345',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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
                Profile saved successfully!
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
                required
                autoComplete="tel"
                disabled={isLoading}
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
                required
                autoComplete="street-address"
                disabled={isLoading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="City"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                  required
                  autoComplete="address-level2"
                  disabled={isLoading}
                />

                <FormInput
                  label="Country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  error={errors.country}
                  required
                  autoComplete="country-name"
                  disabled={isLoading}
                />
              </div>

              <FormInput
                label="Zip Code"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                error={errors.zipCode}
                autoComplete="postal-code"
                disabled={isLoading}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
