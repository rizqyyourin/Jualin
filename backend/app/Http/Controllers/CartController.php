<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get user's shopping cart.
     */
    public function show()
    {
        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $user->id]);
        }

        return response()->json([
            'data' => [
                'id' => $cart->id,
                'user_id' => $cart->user_id,
                'subtotal' => $cart->subtotal,
                'tax' => $cart->tax,
                'shipping_cost' => $cart->shipping_cost,
                'discount' => $cart->discount,
                'total' => $cart->total,
                'items' => $cart->items()->with(['product', 'product.stock'])->get()->map(fn($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'image' => $item->product->images->first()?->image_path,
                        'stock' => $item->product->stock ? [
                            'quantity' => $item->product->stock->quantity,
                        ] : null,
                    ],
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                    'attributes' => $item->attributes,
                ]),
            ],
        ]);
    }

    /**
     * Add item to cart.
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'attributes' => 'nullable|json',
        ]);

        $user = auth()->user();
        $product = Product::findOrFail($validated['product_id']);

        // Get or create cart
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Check if item already exists
        $cartItem = $cart->items()
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $cartItem->quantity += $validated['quantity'];
            $cartItem->subtotal = $cartItem->price * $cartItem->quantity;
            $cartItem->save();
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'price' => $product->price,
                'subtotal' => $product->price * $validated['quantity'],
                'attributes' => $validated['attributes'] ?? null,
            ]);
        }

        $cart->calculateTotals();

        return response()->json([
            'message' => 'Item added to cart successfully',
            'data' => [
                'id' => $cartItem->id,
                'product_id' => $cartItem->product_id,
                'quantity' => $cartItem->quantity,
                'price' => $cartItem->price,
                'subtotal' => $cartItem->subtotal,
            ],
        ], 201);
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(Request $request, string $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $cartItem = CartItem::findOrFail($itemId);

        if ($cartItem->cart->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($validated['quantity'] === 0) {
            $cartItem->delete();
            $cartItem->cart->calculateTotals();

            return response()->json(['message' => 'Item removed from cart']);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->subtotal = $cartItem->price * $cartItem->quantity;
        $cartItem->save();

        $cartItem->cart->calculateTotals();

        return response()->json([
            'data' => [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'subtotal' => $cartItem->subtotal,
            ],
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(string $itemId)
    {
        $cartItem = CartItem::findOrFail($itemId);

        if ($cartItem->cart->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();
        $cart->calculateTotals();

        return response()->json(['message' => 'Item removed from cart']);
    }

    /**
     * Clear entire cart.
     */
    public function clear()
    {
        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'tax' => 0,
                'shipping_cost' => 0,
                'discount' => 0,
                'total' => 0,
            ]);
        }

        return response()->json(['message' => 'Cart cleared successfully']);
    }

    /**
     * Apply discount to cart.
     */
    public function applyDiscount(Request $request)
    {
        $validated = $request->validate([
            'discount_amount' => 'required|numeric|min:0',
        ]);

        $user = auth()->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cart->update(['discount' => $validated['discount_amount']]);
        $cart->calculateTotals();

        return response()->json([
            'message' => 'Discount applied successfully',
            'data' => ['discount' => $cart->discount, 'total' => $cart->total],
        ]);
    }
}
