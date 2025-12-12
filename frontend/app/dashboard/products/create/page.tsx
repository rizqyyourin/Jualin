'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { useUserStore } from '@/lib/stores/userStore';

export default function CreateProductPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useUserStore();

    // Protect route
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/?action=login');
        } else if (!isAuthLoading && isAuthenticated && user?.role !== 'merchant') {
            router.push('/');
        }
    }, [isAuthenticated, isAuthLoading, user, router]);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isAuthLoading || !isAuthenticated || user?.role !== 'merchant') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Generate a random SKU for now if not provided
            // effectively acting as "auto-generate"
            const payload = {
                ...formData,
                sku: `SKU-${Date.now()}`,
                status: 'active', // Default to active for immediate visibility
                is_featured: false,
                category_id: 1, // Defaulting to Electronics (ID 1) for this quick test since dropdown isn't populated dynamically yet
            };

            await apiClient.post('/products', payload);

            // Redirect to dashboard (or product list)
            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6">
                    <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500">Create a new product listing for your store.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                                <CardDescription>Basic information about your product</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="e.g., Premium Wireless Headphones"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={4}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe your product features and benefits..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Inventory</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="price" className="text-sm font-medium text-gray-700">Price ($)</label>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock Quantity</label>
                                        <input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="0"
                                            value={formData.stock}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Image</CardTitle>
                                <CardDescription>URL for your product image</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <label htmlFor="image" className="text-sm font-medium text-gray-700">Image URL</label>
                                    <input
                                        id="image"
                                        name="image"
                                        type="url"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="https://example.com/product.jpg"
                                        value={formData.image}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-gray-500">Provide a direct link to an image.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="gap-2">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isLoading ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
