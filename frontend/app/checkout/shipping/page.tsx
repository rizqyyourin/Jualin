'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cartStore';
import { ChevronRight } from 'lucide-react';

export default function ShippingPage() {
  const { getTotalPrice } = useCartStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 5-7 business days',
      price: 10,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 2-3 business days',
      price: 25,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivery next business day',
      price: 50,
    },
  ];

  const subtotal = Number(getTotalPrice());
  const shippingCost =
    subtotal > 100
      ? 0
      : shippingMethods.find((m) => m.id === shippingMethod)?.price || 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const steps = [
    { number: 1, label: 'Shipping', completed: false, current: true },
    { number: 2, label: 'Payment', completed: false, current: false },
    { number: 3, label: 'Review', completed: false, current: false },
    { number: 4, label: 'Confirmation', completed: false, current: false },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store shipping data in localStorage for next step
    localStorage.setItem('shippingData', JSON.stringify(formData));
    localStorage.setItem('shippingMethod', shippingMethod);
    // Navigate to payment
    window.location.href = '/checkout/payment';
  };

  const isFormValid = Object.values(formData).every((val) => val.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress */}
        <CheckoutProgress steps={steps} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State / Province
                    </label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP / Postal Code
                    </label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    required
                  />
                </div>

                {/* Shipping Method */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-bold mb-4">Shipping Method</h2>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label key={method.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-gray-900">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {method.description}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {subtotal > 100
                            ? 'FREE'
                            : `$${method.price.toFixed(2)}`}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                  <Link href="/cart" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Cart
                    </Button>
                  </Link>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-primary-foreground font-semibold py-3 rounded-lg transition"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {subtotal > 100 ? 'Shipping (Free)' : 'Shipping'}
                  </span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              {subtotal > 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✓ Free shipping applied to your order!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
