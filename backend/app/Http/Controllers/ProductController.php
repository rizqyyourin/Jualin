<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ProductController extends Controller
{

    /**
     * Display a listing of products.
     * Accessible to all (public listing)
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // Filter by merchant
        if ($request->has('user_id')) {
            // Merchant viewing their own products - show all statuses
            $query->where('user_id', $request->user_id);
        } else {
            // Public browsing - only show active products
            $query->where('status', 'active');
        }

        // Filter by category (supports both 'category' and 'category_id')
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        } elseif ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name or sku
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Stock filter
        if ($request->boolean('in_stock')) {
            $query->whereHas('stock', function ($q) {
                $q->where('quantity', '>', 0);
            });
        }

        // Filter featured products
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Sorting - supports 'sort' parameter with format like 'price-low', 'price-high', 'rating', 'newest'
        if ($request->has('sort')) {
            $sort = $request->get('sort');
            switch ($sort) {
                case 'price-low':
                case 'price_low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price-high':
                case 'price_high':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->withAvg('reviews', 'rating')
                        ->orderBy('reviews_avg_rating', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            // Default sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);

        // Eager load stock relation
        $products = $query->with('stock')->paginate($perPage);

        return response()->json([
            'message' => 'Products retrieved successfully',
            'data' => $products,
        ]);
    }

    /**
     * Display the specified product.
     * Accessible to all
     */
    public function show(Product $product)
    {
        return response()->json([
            'message' => 'Product retrieved successfully',
            'data' => $product->load(['images', 'stock', 'reviews']),
        ]);
    }

    /**
     * Store a newly created product.
     * Only merchants can create products
     */
    /**
     * Store a newly created product.
     * Only merchants can create products
     */
    public function store(Request $request)
    {
        // Only merchants can create products
        if (!auth()->user()->isMerchant()) {
            return response()->json([
                'message' => 'Only merchants can create products',
            ], 403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            // 'sku' => 'required|string|unique:products', // SKU removed from architecture
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,active,archived',
            'stock' => 'required|integer|min:0', // Added stock validation
        ]);

        // Set user_id & defaults
        $baseData = collect($validated)->except(['stock'])->toArray();
        $baseData['user_id'] = auth()->id();
        $baseData['status'] = $baseData['status'] ?? 'draft';
        $baseData['is_featured'] = $baseData['is_featured'] ?? false;

        // Auto-generate hidden SKU since it's removed from architecture but required by DB
        $baseData['sku'] = (string) Str::uuid();

        // Generate slug if not provided
        if (empty($baseData['slug'] ?? null)) {
            // Generate unique slug with timestamp to avoid conflicts
            $baseSlug = Str::slug($baseData['name']);
            $baseData['slug'] = $baseSlug . '-' . time();
        }

        $product = Product::create($baseData);

        // Create Stock
        $product->stock()->create([
            'quantity' => $validated['stock'],
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load('stock'),
        ], 201);
    }

    /**
     * Update the specified product.
     * Only merchant owner can update
     */
    public function update(Request $request, Product $product)
    {
        // Check authorization
        if ($product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this product',
            ], 403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'slug' => "sometimes|string|unique:products,slug,{$product->id}",
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            // 'sku' => ... removed
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'status' => 'nullable|in:draft,active,archived',
            'stock' => 'sometimes|integer|min:0', // Added stock validation
        ]);

        // Separate stock data
        $stockQty = $validated['stock'] ?? null;
        $productData = collect($validated)->except(['stock'])->filter()->toArray();

        // Ensure we don't try to update SKU even if sent (though validation should strip it if not in rules)
        // But since we removed it from validation, it won't be in $validated anyway.

        if (!empty($productData)) {
            $product->update($productData);
        }

        // Update Stock if provided
        if ($stockQty !== null) {
            $product->stock()->updateOrCreate(
                ['product_id' => $product->id],
                ['quantity' => $stockQty]
            );
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->load('stock'),
        ]);
    }

    /**
     * Delete the specified product.
     * Only merchant owner can delete
     */
    public function destroy(Product $product)
    {
        // Check authorization
        if ($product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this product',
            ], 403);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Upload product images
     */
    public function uploadImages(Request $request, Product $product)
    {
        // Check authorization
        if ($product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this product',
            ], 403);
        }

        $validated = $request->validate([
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_primary' => 'nullable|array',
            'is_primary.*' => 'boolean',
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store("products/{$product->id}", 'public');

            $productImage = ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $path,
                'is_primary' => $validated['is_primary'][$index] ?? false,
                'sort_order' => $index,
            ]);

            $uploadedImages[] = $productImage;
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'data' => $uploadedImages,
        ], 201);
    }

    /**
     * Delete product image
     */
    public function deleteImage(Product $product, ProductImage $productImage)
    {
        // Check authorization
        if ($product->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this product',
            ], 403);
        }

        // Ensure image belongs to product
        if ($productImage->product_id !== $product->id) {
            return response()->json([
                'message' => 'Image does not belong to this product',
            ], 422);
        }

        $productImage->delete();

        return response()->json([
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * Get product recommendations
     */
    public function recommendations(Product $product, Request $request)
    {
        $limit = $request->get('limit', 6);
        $type = $request->get('type', 'similar');

        // For now, return products from the same category
        $recommendations = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->with('stock')
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $recommendations,
        ]);
    }

    /**
     * Get review statistics for a product
     */
    public function reviewStats(Product $product)
    {
        $reviews = $product->reviews()->get();

        $stats = [
            'average_rating' => $reviews->avg('rating') ?? 0,
            'total_reviews' => $reviews->count(),
            'rating_distribution' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
