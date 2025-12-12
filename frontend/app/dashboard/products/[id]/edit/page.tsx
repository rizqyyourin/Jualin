'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { useUserStore } from '@/lib/stores/userStore';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const { user, isAuthenticated, isLoading: isAuthLoading } = useUserStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        sku: '',
        status: 'active'
    });

    // Protect route
    useEffect(() => {
        if (!isAuthLoading) {
            if (!isAuthenticated) router.push('/?action=login');
            else if (user?.role !== 'merchant') router.push('/');
        }
    }, [isAuthLoading, isAuthenticated, user, router]);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const response = await apiClient.get(`/products/${id}`);
                const product = response.data.data;
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    stock: product.stock?.quantity || 0, // Backend might return nested stock object or flat field? Let's check model. Actually backend returns stock relation, so quantity is inside.
                    category_id: product.category_id,
                    sku: product.sku,
                    status: product.status
                });

                // Correction: The backend seeder accessed $product->stock, but API response structure needs verification. 
                // ProductController: $product->load(['images', 'stock', 'reviews'])
                // Stock Model: quantity
                // So it should be product.stock[0].quantity or just product.stock.quantity (if hasOne vs hasMany).
                // Let's assume stock is hasOne or finding it in the relation.
                // Re-reading controller: logic is separate. 
                // Actually in controller index/show, stock is loaded.
                // Let's safe check keys.
                // However, standard Laravel structure for relations:
                // product: { ..., stock: { quantity: 10 } }

                // Let's use a safe accessor
                const stockQty = product.stock?.quantity ?? product.stock ?? 0;

                setFormData(prev => ({ ...prev, stock: stockQty }));

            } catch (error) {
                console.error('Failed to fetch product:', error);
                alert('Failed to load product details');
                router.push('/dashboard/products');
            } finally {
                setIsFetching(false);
            }
        };

        if (isAuthenticated) {
            fetchProduct();
        }
    }, [id, isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                // Ensure stock is updated separately if needed, but here we likely update product fields. 
                // Wait, does ProductController update stock?
                // Looking at ProductController.php: update method: $product->update($validated).
                // It does NOT update Stock model. 
                // This is a backend limitation we might discover. 
                // For now, let's just update product fields.
                // If stock update is separate, this might fail to update stock quantity.
                // BUT, for 'price', 'name', 'description', it should work.
            };

            await apiClient.put(`/products/${id}`, payload);

            router.push('/dashboard/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading || isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6">
                    <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Products
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-500">Update your product information.</p>
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
                                            disabled // Backend doesn't support stock update in product update endpoint yet
                                            title="Stock management is separate"
                                            className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                            value={formData.stock}
                                            onChange={handleChange}
                                        />
                                        <p className="text-xs text-orange-500">Stock updates not supported in MVP edit</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="gap-2">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
