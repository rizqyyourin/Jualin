<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist items.
     */
    public function index()
    {
        $user = auth()->user();
        $wishlists = Wishlist::where('user_id', $user->id)
            ->with('product.images')
            ->get();

        return response()->json([
            'data' => $wishlists->map(fn($wish) => [
                'id' => $wish->id,
                'product_id' => $wish->product_id,
                'product' => [
                    'id' => $wish->product->id,
                    'name' => $wish->product->name,
                    'slug' => $wish->product->slug,
                    'description' => $wish->product->description,
                    'price' => $wish->product->price,
                    'image' => $wish->product->images->first()?->image_path,
                    'category_id' => $wish->product->category_id,
                ],
                'created_at' => $wish->created_at,
            ]),
        ]);
    }

    /**
     * Add product to wishlist.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = auth()->user();
        $product = Product::findOrFail($validated['product_id']);

        // Check if already in wishlist
        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Product already in wishlist',
            ], 409);
        }

        $wishlist = Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist successfully',
            'data' => [
                'id' => $wishlist->id,
                'product_id' => $wishlist->product_id,
            ],
        ], 201);
    }

    /**
     * Remove product from wishlist.
     */
    public function destroy(string $wishlistId)
    {
        $wishlist = Wishlist::findOrFail($wishlistId);

        if ($wishlist->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $wishlist->delete();

        return response()->json(['message' => 'Product removed from wishlist']);
    }

    /**
     * Check if product is in user's wishlist.
     */
    public function isInWishlist(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = auth()->user();
        $inWishlist = Wishlist::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->exists();

        return response()->json([
            'data' => ['in_wishlist' => $inWishlist],
        ]);
    }
}
