'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilter, FilterState } from '@/components/products/ProductFilter';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Mock data - fallback if API is unavailable
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    price: 199.99,
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    price: 299.99,
    category: 'Electronics',
    rating: 4.8,
    reviews: 256,
    inStock: true,
  },
  {
    id: '3',
    name: 'Premium Leather Jacket',
    price: 149.99,
    category: 'Fashion',
    rating: 4.3,
    reviews: 89,
    inStock: false,
  },
  {
    id: '4',
    name: 'Minimalist Coffee Maker',
    price: 79.99,
    category: 'Home',
    rating: 4.6,
    reviews: 342,
    inStock: true,
  },
  {
    id: '5',
    name: 'Organic Skincare Set',
    price: 59.99,
    category: 'Beauty',
    rating: 4.7,
    reviews: 512,
    inStock: true,
  },
  {
    id: '6',
    name: 'Professional Yoga Mat',
    price: 45.99,
    category: 'Sports',
    rating: 4.4,
    reviews: 178,
    inStock: true,
  },
  {
    id: '7',
    name: 'The Art of Programming',
    price: 39.99,
    category: 'Books',
    rating: 4.9,
    reviews: 423,
    inStock: true,
  },
  {
    id: '8',
    name: 'Portable Bluetooth Speaker',
    price: 89.99,
    category: 'Electronics',
    rating: 4.5,
    reviews: 234,
    inStock: true,
  },
];

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    priceRange: [0, 1000],
    sortBy: 'newest',
    inStock: false,
  });

  // Fetch categories for lookup
  const { categories } = useCategories();

  // Create category lookup map
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<number, string>);
  }, [categories]);

  // Fetch products from API with all filters
  // Only send price range if it's not the default 0-1000
  const hasCustomPriceRange = filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000;

  const { products: apiProducts, loading, error } = useProducts({
    page: 1,
    perPage: 15,
    categoryId: filters.categories.length > 0 ? filters.categories[0] : undefined,
    search: filters.search ? filters.search : undefined,
    minPrice: hasCustomPriceRange ? filters.priceRange[0] : undefined,
    maxPrice: hasCustomPriceRange ? filters.priceRange[1] : undefined,
    sort: filters.sortBy !== 'newest' ? filters.sortBy : undefined,
    inStockOnly: filters.inStock || undefined,
  });

  // Use API products
  const products = apiProducts;

  // Apply client-side sorting if needed (sorting is now done server-side)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter (only for mock data, API already handles it)
    if (filters.search && apiProducts.length === 0) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Price filter (only for mock data, API already handles it)
    if ((filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && apiProducts.length === 0) {
      result = result.filter((p) => {
        const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Stock filter (only for mock data, API already handles it)
    if (filters.inStock && apiProducts.length === 0) {
      result = result.filter((p) => ('inStock' in p ? p.inStock : true));
    }

    // Sorting (only for mock data, API already handles it)
    if (apiProducts.length === 0) {
      switch (filters.sortBy) {
        case 'price-low':
          result.sort((a, b) => {
            const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
            const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
            return priceA - priceB;
          });
          break;
        case 'price-high':
          result.sort((a, b) => {
            const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
            const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
            return priceB - priceA;
          });
          break;
        case 'rating':
          result.sort((a, b) => {
            const ratingA = Number('rating' in a ? a.rating : 0) || 0;
            const ratingB = Number('rating' in b ? b.rating : 0) || 0;
            return ratingB - ratingA;
          });
          break;
        case 'newest':
        default:
          break;
      }
    }

    return result;
  }, [filters, products, apiProducts.length]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Discover Our <span className="text-primary">Products</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of quality products from top sellers
        </p>
      </div>

      {/* Error Alert */}
      {error && apiProducts.length === 0 && (
        <Alert className="bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          Could not load products from server. Showing default products instead.
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filter */}
        <div className="lg:col-span-1">
          <ProductFilter onFiltersChange={setFilters} />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading && apiProducts.length === 0 ? (
            // Loading State
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
                  <span className="font-semibold">{products.length}</span> products
                </p>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={typeof product.price === 'string' ? parseFloat(product.price) : product.price}
                      image={product.image}
                      category={product.category || categoryMap[product.category_id]}
                      rating={product.rating}
                      reviews={product.reviews}
                      inStock={product.inStock || (product.stock?.quantity ? product.stock.quantity > 0 : true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 mb-4">No products found</p>
                  <button
                    onClick={() =>
                      setFilters({
                        search: '',
                        categories: [],
                        priceRange: [0, 1000],
                        sortBy: 'newest',
                        inStock: false,
                      })
                    }
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
