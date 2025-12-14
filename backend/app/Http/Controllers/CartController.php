<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

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
                'shipping' => $cart->shipping_cost,
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

        try {
            $user = auth()->user();
            $cartItem = $this->cartService->addItem(
                $user->id,
                $validated['product_id'],
                $validated['quantity']
            );

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
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
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

        try {
            if ($validated['quantity'] === 0) {
                $this->cartService->removeItem($itemId);
                return response()->json(['message' => 'Item removed from cart']);
            }

            $updatedItem = $this->cartService->updateItem($itemId, $validated['quantity']);

            return response()->json([
                'message' => 'Cart updated successfully',
                'data' => [
                    'id' => $updatedItem->id,
                    'quantity' => $updatedItem->quantity,
                    'subtotal' => $updatedItem->subtotal,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
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

        try {
            $this->cartService->removeItem($itemId);
            return response()->json(['message' => 'Item removed from cart']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Clear entire cart.
     */
    public function clear()
    {
        try {
            $user = auth()->user();
            $this->cartService->clear($user->id);
            return response()->json(['message' => 'Cart cleared successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
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
