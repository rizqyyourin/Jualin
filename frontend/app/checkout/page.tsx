'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cartStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, loadCart, loading } = useCartStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        notes: '',
    });

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Create order from cart
            const response = await apiClient.post('/orders/from-cart', {
                shipping_address: {
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zipCode,
                    country: formData.country,
                },
                customer_notes: formData.notes,
            });

            // Show success alert
            alert('✅ Order placed successfully! Your order is pending seller confirmation.');

            // Redirect to confirmation page with order ID
            router.push(`/checkout/confirmation?order=${response.data.data.order_number}`);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || 'Failed to place order. Please try again.';
            setError(errorMessage);
            console.error('Order creation failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid =
        formData.fullName.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.phone.trim() !== '' &&
        formData.address.trim() !== '' &&
        formData.city.trim() !== '' &&
        formData.state.trim() !== '' &&
        formData.zipCode.trim() !== '' &&
        formData.country.trim() !== '';

    if (loading && !cart) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const items = cart?.items || [];
    const subtotal = Number(cart?.subtotal || 0);
    const shipping = Number(cart?.shipping || 0);
    const tax = Number(cart?.tax || 0);
    const total = Number(cart?.total || 0);

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Add some items before checking out!</p>
                <Link href="/shop">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/cart" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-semibold mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-600">Complete your order by providing shipping details</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 sm:p-8">
                            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
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
                                            Email *
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
                                            Phone Number *
                                        </label>
                                        <Input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+62 812 3456 7890"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <Input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Jl. Sudirman No. 123"
                                        required
                                    />
                                </div>

                                {/* City, State, Zip */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <Input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Jakarta"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State / Province *
                                        </label>
                                        <Input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="DKI Jakarta"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP / Postal Code *
                                        </label>
                                        <Input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="12345"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>
                                    <Input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="Indonesia"
                                        required
                                    />
                                </div>

                                {/* Order Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any special instructions for your order..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-6 border-t">
                                    <Link href="/cart" className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Back to Cart
                                        </Button>
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={!isFormValid || submitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-lg transition"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Placing Order...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="p-6 sticky top-20 space-y-4">
                            <h2 className="font-bold text-lg">Order Summary</h2>

                            {/* Cart Items */}
                            <div className="space-y-3 pb-4 border-b max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {item.product?.name || 'Product'}
                                            </p>
                                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-primary">
                                                ${Number(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 pb-4 border-b">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    Your order will be confirmed by the seller after placement.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
