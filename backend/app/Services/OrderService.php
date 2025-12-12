<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\TransactionLog;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected StockService $stockService;
    protected CartService $cartService;
    protected CouponService $couponService;
    protected InvoiceService $invoiceService;

    public function __construct(
        StockService $stockService,
        CartService $cartService,
        CouponService $couponService,
        InvoiceService $invoiceService
    ) {
        $this->stockService = $stockService;
        $this->cartService = $cartService;
        $this->couponService = $couponService;
        $this->invoiceService = $invoiceService;
    }

    /**
     * Create order from cart.
     */
    public function createFromCart(int $userId, int $merchantId, array $data): Order
    {
        return DB::transaction(function () use ($userId, $merchantId, $data) {
            $cart = Cart::where('user_id', $userId)->firstOrFail();
            $cartItems = $cart->items()->with('product')->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('Cart is empty');
            }

            // Calculate subtotal
            $subtotal = $cartItems->sum(fn ($item) => $item->price * $item->quantity);

            // Apply coupon if provided
            $discountAmount = 0;
            $couponUsage = null;
            if (isset($data['coupon_code'])) {
                $coupon = $this->couponService->validate(
                    $data['coupon_code'],
                    $userId,
                    $subtotal
                );

                if ($coupon) {
                    $discountAmount = $this->couponService->calculateDiscount($coupon, $subtotal);
                }
            }

            // Calculate tax and shipping
            $tax = $subtotal * 0.1; // 10% tax
            $shippingCost = $data['shipping_cost'] ?? 0;
            $total = $subtotal - $discountAmount + $tax + $shippingCost;

            // Create order
            $order = Order::create([
                'user_id' => $userId,
                'merchant_id' => $merchantId,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount_amount' => $discountAmount,
                'shipping_cost' => $shippingCost,
                'total_price' => $total,
                'payment_method' => $data['payment_method'] ?? null,
                'shipping_method' => $data['shipping_method'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'customer_notes' => $data['notes'] ?? null,
            ]);

            // Create order items and deduct stock
            foreach ($cartItems as $cartItem) {
                $totalPrice = ($cartItem->price * $cartItem->quantity);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->price,
                    'discount_amount' => 0,
                    'total_price' => $totalPrice,
                ]);

                // Deduct stock
                if (!$this->stockService->deductStock($cartItem->product_id, $cartItem->quantity, 'purchase')) {
                    throw new \Exception('Stock deduction failed for product: ' . $cartItem->product->name);
                }
            }

            // Apply coupon if valid
            if (isset($data['coupon_code']) && $discountAmount > 0) {
                $couponUsage = $this->couponService->apply(
                    $coupon,
                    $order->id,
                    $userId,
                    $discountAmount
                );
            }

            // Add status history
            $this->addStatusHistory($order->id, 'pending', 'Order created from cart');

            // Generate invoice
            $this->invoiceService->generate($order);

            // Log transaction
            TransactionLog::log(
                $userId,
                'order',
                $total,
                'Order created',
                [
                    'order_id' => $order->id,
                    'items_count' => $cartItems->count(),
                    'coupon_applied' => $discountAmount > 0,
                ],
                $order->id
            );

            // Clear cart
            $this->cartService->clear($userId);

            // Refresh order to get fresh data
            $order->refresh();

            return $order;
        });
    }

    /**
     * Confirm order (move from pending to confirmed).
     */
    public function confirm(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->update(['status' => 'confirmed']);
            $this->addStatusHistory($order->id, 'confirmed', 'Order confirmed');
            return $order;
        });
    }

    /**
     * Ship order.
     */
    public function ship(Order $order, string $trackingNumber = null): Order
    {
        return DB::transaction(function () use ($order, $trackingNumber) {
            $order->update([
                'status' => 'shipped',
                'shipped_at' => now(),
                'tracking_number' => $trackingNumber,
            ]);
            $this->addStatusHistory($order->id, 'shipped', 'Order shipped with tracking: ' . $trackingNumber);
            return $order;
        });
    }

    /**
     * Mark order as delivered.
     */
    public function deliver(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);
            $this->addStatusHistory($order->id, 'delivered', 'Order delivered');
            return $order;
        });
    }

    /**
     * Cancel order and return stock.
     */
    public function cancel(Order $order, string $reason = ''): Order
    {
        return DB::transaction(function () use ($order, $reason) {
            if ($order->status === 'delivered' || $order->status === 'cancelled') {
                throw new \Exception('Cannot cancel order with status: ' . $order->status);
            }

            // Return stock for all items
            foreach ($order->orderItems as $item) {
                $this->stockService->returnStock($item->product_id, $item->quantity, 'return');
            }

            // Revoke coupon if applied
            if ($order->couponUsage) {
                $this->couponService->revoke($order->couponUsage);
            }

            $order->update(['status' => 'cancelled', 'cancelled_at' => now()]);
            $this->addStatusHistory($order->id, 'cancelled', 'Order cancelled: ' . $reason);

            // Log refund
            TransactionLog::log(
                $order->user_id,
                'order_refund',
                $order->total_price,
                'Order cancelled and refunded',
                ['reason' => $reason],
                $order->id
            );

            return $order;
        });
    }

    /**
     * Add status history record.
     */
    protected function addStatusHistory(int $orderId, string $status, string $notes = ''): void
    {
        OrderStatusHistory::create([
            'order_id' => $orderId,
            'status' => $status,
            'notes' => $notes,
            'changed_at' => now(),
        ]);
    }

    /**
     * Generate unique order number.
     */
    protected function generateOrderNumber(): string
    {
        // Format: ORD-YYYYMMDD-###### (6 random digits)
        $date = now()->format('Ymd');
        $random = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        return "ORD-{$date}-{$random}";
    }

    /**
     * Get order with all details.
     */
    public function getOrderDetails(int $orderId)
    {
        return Order::with([
            'user',
            'merchant',
            'orderItems.product',
            'couponUsage',
            'shippingMethod',
            'customerAddress',
            'statusHistory',
        ])->findOrFail($orderId);
    }

    /**
     * Get user's orders.
     */
    public function getUserOrders(int $userId, array $filters = [])
    {
        $query = Order::where('user_id', $userId)
            ->with('merchant', 'orderItems.product');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('created_at')->paginate(10);
    }

    /**
     * Get merchant's orders.
     */
    public function getMerchantOrders(int $merchantId, array $filters = [])
    {
        $query = Order::where('merchant_id', $merchantId)
            ->with('user', 'orderItems.product');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('created_at')->paginate(15);
    }
}
