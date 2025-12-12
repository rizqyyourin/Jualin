<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{

    /**
     * Display all categories
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Filter by merchant
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter active only
        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'message' => 'Categories retrieved successfully',
            'data' => $categories,
        ]);
    }

    /**
     * Display the specified category
     */
    public function show(Category $category)
    {
        $category->load('products');

        return response()->json([
            'message' => 'Category retrieved successfully',
            'data' => $category,
        ]);
    }

    /**
     * Store a newly created category
     * Only merchants can create categories
     */
    public function store(Request $request)
    {
        // Only merchants can create categories
        if (!auth()->user()->isMerchant()) {
            return response()->json([
                'message' => 'Only merchants can create categories',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:categories',
            'description' => 'nullable|string',
            'icon_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
        ]);

        // Set user_id
        $validated['user_id'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Generate slug if not provided
        if (empty($validated['slug'] ?? null)) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Update the specified category
     * Only merchant owner can update
     */
    public function update(Request $request, Category $category)
    {
        // Check authorization
        if ($category->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to update this category',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => "sometimes|string|unique:categories,slug,{$category->id}",
            'description' => 'nullable|string',
            'icon_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Delete the specified category
     * Only merchant owner can delete
     */
    public function destroy(Category $category)
    {
        // Check authorization
        if ($category->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this category',
            ], 403);
        }

        // Check if category has products
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with products',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
