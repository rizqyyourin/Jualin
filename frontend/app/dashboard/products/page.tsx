'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Search, MoreHorizontal, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { useUserStore } from '@/lib/stores/userStore';

interface Product {
    id: number;
    name: string;
    // sku: string; // Removed from architecture
    price: number;
    stock: {
        quantity: number;
    } | null;
    status: string;
    created_at: string;
    category_id: number;
    image?: string;
}

export default function ProductListPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useUserStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Auth check
        if (!isAuthLoading) {
            if (!isAuthenticated) router.push('/?action=login');
            else if (user?.role !== 'merchant') router.push('/');
        }
    }, [isAuthLoading, isAuthenticated, user, router]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            // Fetch products created by this user
            const response = await apiClient.get('/products', {
                params: {
                    user_id: user?.id, // Filter by merchant
                    sort: 'newest'
                }
            });
            setProducts(response.data.data.data || []); // Laravel paginate response structure: data.data
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchProducts();
        }
    }, [isAuthenticated, user?.id]);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleDeleteClick = (id: number) => {
        console.log('Delete clicked for product:', id);
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;

        const id = confirmDeleteId;
        setConfirmDeleteId(null);

        console.log('Deleting product:', id);
        console.log('User:', user);
        console.log('Auth token exists:', !!localStorage.getItem('authToken'));

        setDeletingId(id);
        try {
            const response = await apiClient.delete(`/products/${id}`);
            console.log('Delete response:', response);

            // Refresh list by removing the deleted product
            setProducts(prev => prev.filter(p => p.id !== id));

            // Show success toast
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);

            const errorMessage = error.response?.data?.message || 'Failed to delete product. Please try again.';
            alert(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteId(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isAuthLoading || (isAuthenticated && isLoading && products.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-gray-500 mt-1">Manage your product catalog</p>
                    </div>
                    <Link href="/dashboard/products/create">
                        <Button className="gap-2">
                            <Plus size={16} /> Add Product
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>
                            You have {products.length} total products.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && filteredProducts.length === 0 && (
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
                                <Link href="/dashboard/products/create">
                                    <Button variant="outline">Create Product</Button>
                                </Link>
                            </div>
                        )}

                        {/* Products Table */}
                        {!isLoading && filteredProducts.length > 0 && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    <div className="flex justify-center items-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                    No products found. Start by creating one!
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                                                            {product.image ? (
                                                                <Image
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(product.stock?.quantity || 0) > 0
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.stock?.quantity || 0} in stock
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboard/products/${product.id}/edit`}>
                                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                    onClick={() => {
                                                                        console.log('Delete clicked!');
                                                                        handleDeleteClick(product.id);
                                                                    }}
                                                                >
                                                                    {deletingId === product.id ? (
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                    )}
                                                                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            {confirmDeleteId && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancelDelete}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Product deleted successfully!</span>
                    </div>
                </div>
            )}
        </div>
    );
}
