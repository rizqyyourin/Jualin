<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

class CartService
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Get or create cart for user.
     */
    public function getOrCreateCart(int $userId): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $userId],
            ['subtotal' => 0, 'tax' => 0, 'shipping_cost' => 0, 'discount' => 0, 'total' => 0]
        );
    }

    /**
     * Add item to cart.
     */
    public function addItem(int $userId, int $productId, int $quantity): CartItem
    {
        $cart = $this->getOrCreateCart($userId);
        $product = Product::findOrFail($productId);

        // Check stock
        if (!$this->stockService->hasStock($productId, $quantity)) {
            throw new \Exception('Insufficient stock for this product');
        }

        // Check if item already in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->subtotal = $cartItem->price * $cartItem->quantity;
            $cartItem->save();
        } else {
            $subtotal = $product->price * $quantity;
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $product->price,
                'subtotal' => $subtotal,
            ]);
        }

        $this->updateCartTotal($cart->id);
        return $cartItem;
    }

    /**
     * Update item quantity in cart.
     */
    public function updateItem(int $cartItemId, int $quantity): CartItem
    {
        $cartItem = CartItem::findOrFail($cartItemId);

        // Check stock
        if (!$this->stockService->hasStock($cartItem->product_id, $quantity)) {
            throw new \Exception('Insufficient stock for this product');
        }

        $cartItem->quantity = $quantity;
        $cartItem->subtotal = $cartItem->price * $quantity;
        $cartItem->save();
        
        $this->updateCartTotal($cartItem->cart_id);

        return $cartItem;
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(int $cartItemId): void
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $cartId = $cartItem->cart_id;

        $cartItem->delete();
        $this->updateCartTotal($cartId);
    }

    /**
     * Clear entire cart.
     */
    public function clear(int $userId): void
    {
        $cart = Cart::where('user_id', $userId)->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->update(['total_items' => 0, 'total_price' => 0]);
        }
    }

    /**
     * Get cart with items and totals.
     */
    public function getCartWithTotals(int $userId): array
    {
        $cart = $this->getOrCreateCart($userId);

        return [
            'cart' => $cart,
            'items' => $cart->items()->with('product')->get(),
            'total_items' => $cart->items()->sum('quantity'),
            'total_price' => $cart->items()->sum('subtotal'),
        ];
    }

    /**
     * Update cart totals (called after item changes).
     */
    protected function updateCartTotal(int $cartId): void
    {
        $cart = Cart::findOrFail($cartId);

        $totalItems = CartItem::where('cart_id', $cartId)->sum('quantity');
        $totalPrice = CartItem::where('cart_id', $cartId)->sum('subtotal');

        $cart->update([
            'total' => $totalPrice,
            'subtotal' => $totalPrice,
        ]);
    }
}
