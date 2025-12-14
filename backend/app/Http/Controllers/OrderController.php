<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;

class OrderController extends Controller
{

    /**
     * Display orders list
     * Customer sees their own orders, Merchant sees orders from their products
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        if ($user->isMerchant()) {
            // Merchant sees orders for their products
            $orders = Order::whereHas('items.product', function (Builder $query) {
                $query->where('user_id', auth()->id());
            })->with('items', 'statusHistory', 'customer')
                ->paginate($request->get('per_page', 15));
        } else {
            // Customer sees their own orders
            $orders = Order::where('customer_id', $user->id)
                ->with('items', 'statusHistory')
                ->paginate($request->get('per_page', 15));
        }

        // Filter by status
        if ($request->has('status')) {
            $orders->getCollection()->filter(function ($order) use ($request) {
                return $order->status === $request->status;
            });
        }

        return response()->json([
            'message' => 'Orders retrieved successfully',
            'data' => $orders,
        ]);
    }

    /**
     * Display the specified order
     */
    public function show(Order $order)
    {
        // Check authorization
        if (auth()->user()->isCustomer() && $order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to view this order',
            ], 403);
        }

        if (auth()->user()->isMerchant()) {
            // Check if merchant owns any products in this order
            $merchantOwnedCount = $order->items()
                ->whereHas('product', function (Builder $query) {
                    $query->where('user_id', auth()->id());
                })
                ->count();

            if ($merchantOwnedCount === 0) {
                return response()->json([
                    'message' => 'Unauthorized to view this order',
                ], 403);
            }
        }

        $order->load('items.product', 'customer', 'statusHistory', 'merchant');

        return response()->json([
            'message' => 'Order retrieved successfully',
            'data' => $order,
        ]);
    }

    /**
     * Create a new order
     * Only customers can create orders
     */
    public function store(Request $request)
    {
        // Only customers can create orders
        if (!auth()->user()->isCustomer()) {
            return response()->json([
                'message' => 'Only customers can create orders',
            ], 403);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'shipping_address' => 'required|array',
            'shipping_address.recipient_name' => 'required|string',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.province' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();

        // Get merchant_id from first item's product
        $firstProduct = Product::findOrFail($validated['items'][0]['product_id']);
        $merchantId = $firstProduct->user_id;

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'merchant_id' => $merchantId,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'shipping_address' => $validated['shipping_address'],
            'customer_notes' => $validated['notes'] ?? null,
        ]);

        $totalPrice = 0;

        // Add items
        foreach ($validated['items'] as $itemData) {
            $total = ($itemData['unit_price'] * $itemData['quantity']);
            $item = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $itemData['product_id'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'total_price' => $total,
            ]);

            $totalPrice += $total;
        }

        // Update total price
        $order->update(['total_price' => $totalPrice]);

        // Create initial status history
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => 'pending',
            'notes' => 'Order created',
            'changed_by' => $user->id,
        ]);

        $order->load('items.product', 'statusHistory');

        return response()->json([
            'message' => 'Order created successfully',
            'data' => $order,
        ], 201);
    }

    /**
     * Create order from cart
     * Simplified checkout: create order directly from cart items
     */
    public function createFromCart(Request $request)
    {
        $user = auth()->user();

        // Get user's cart
        $cart = Cart::where('user_id', $user->id)->with(['items.product.stock'])->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty',
            ], 422);
        }

        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string',
            'shipping_address.email' => 'required|email',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'shipping_address.zip_code' => 'required|string',
            'shipping_address.country' => 'required|string',
            'customer_notes' => 'nullable|string',
        ]);

        // Start transaction
        DB::beginTransaction();

        try {
            // Validate stock availability
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $stockQuantity = $product->stock->quantity ?? 0;

                if ($cartItem->quantity > $stockQuantity) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}. Only {$stockQuantity} available.",
                    ], 422);
                }
            }

            // Get merchant_id from first item's product
            $firstProduct = $cart->items->first()->product;
            $merchantId = $firstProduct->user_id;

            // Create order with pending status
            $order = Order::create([
                'user_id' => $user->id,
                'merchant_id' => $merchantId,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_status' => 'pending',
                'shipping_address' => $validated['shipping_address'],
                'customer_notes' => $validated['customer_notes'] ?? null,
            ]);

            $totalPrice = 0;

            // Create order items and reduce stock
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $total = ($cartItem->price * $cartItem->quantity);

                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price,
                    'total_price' => $total,
                ]);

                // Don't reduce stock yet - wait for seller confirmation

                $totalPrice += $total;
            }

            // Update order total price
            $order->update(['total_price' => $totalPrice]);

            // Create initial status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'notes' => 'Order created, waiting for seller confirmation',
                'changed_by' => $user->id,
            ]);

            // Clear cart
            $cart->items()->delete();
            $cart->update([
                'subtotal' => 0,
                'tax' => 0,
                'shipping_cost' => 0,
                'discount' => 0,
                'total' => 0,
            ]);

            DB::commit();

            $order->load('items.product', 'statusHistory');

            return response()->json([
                'message' => 'Order created successfully',
                'data' => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update order status
     * Only merchants can update status
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Check if merchant owns products in this order
        $merchantOwnedCount = $order->items()
            ->whereHas('product', function (Builder $query) {
                $query->where('user_id', auth()->id());
            })
            ->count();

        if ($merchantOwnedCount === 0) {
            return response()->json([
                'message' => 'Unauthorized to update this order',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string',
        ]);

        $order->updateStatus(
            $validated['status'],
            $validated['notes'] ?? null,
            auth()->id()
        );

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => $order->load('statusHistory'),
        ]);
    }

    /**
     * Cancel order
     * Customer can cancel pending orders
     */
    public function cancel(Request $request, Order $order)
    {
        // Only order customer can cancel
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized to cancel this order',
            ], 403);
        }

        // Can only cancel pending/confirmed orders
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Cannot cancel order with status: ' . $order->status,
            ], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $order->updateStatus(
            'cancelled',
            $validated['reason'] ?? 'Cancelled by customer',
            auth()->id()
        );

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => $order->load('statusHistory'),
        ]);
    }

    /**
     * Seller confirms order
     * Only merchants can confirm orders
     */
    public function confirm(Request $request, Order $order)
    {
        // Check if merchant owns products in this order
        $merchantOwnedCount = $order->items()
            ->whereHas('product', function (Builder $query) {
                $query->where('user_id', auth()->id());
            })
            ->count();

        if ($merchantOwnedCount === 0) {
            return response()->json([
                'message' => 'Unauthorized to confirm this order',
            ], 403);
        }

        // Can only confirm pending orders
        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Can only confirm pending orders',
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Deduct stock when confirming
            foreach ($order->items as $orderItem) {
                $product = $orderItem->product;
                $stockQuantity = $product->stock->quantity ?? 0;

                if ($orderItem->quantity > $stockQuantity) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}. Only {$stockQuantity} available.",
                    ], 422);
                }

                // Reduce stock
                $product->stock->decrement('quantity', $orderItem->quantity);
            }

            // Update order status
            $order->updateStatus(
                'confirmed',
                $request->input('notes', 'Order confirmed by seller'),
                auth()->id()
            );

            DB::commit();

            return response()->json([
                'message' => 'Order confirmed successfully',
                'data' => $order->load('statusHistory'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to confirm order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Seller marks order as completed
     * Only merchants can complete orders
     */
    public function complete(Request $request, Order $order)
    {
        // Check if merchant owns products in this order
        $merchantOwnedCount = $order->items()
            ->whereHas('product', function (Builder $query) {
                $query->where('user_id', auth()->id());
            })
            ->count();

        if ($merchantOwnedCount === 0) {
            return response()->json([
                'message' => 'Unauthorized to complete this order',
            ], 403);
        }

        // Can only complete confirmed orders
        if ($order->status !== 'confirmed') {
            return response()->json([
                'message' => 'Can only complete confirmed orders',
            ], 422);
        }

        $order->updateStatus(
            'completed',
            $request->input('notes', 'Order completed by seller'),
            auth()->id()
        );

        return response()->json([
            'message' => 'Order marked as completed',
            'data' => $order->load('statusHistory'),
        ]);
    }
}
