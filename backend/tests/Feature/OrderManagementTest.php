<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockHistory;
use App\Models\TransactionLog;
use App\Models\User;
use App\Services\CartService;
use App\Services\CouponService;
use App\Services\InvoiceService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $merchant;
    protected Category $category;
    protected Product $product;
    protected Coupon $coupon;

    protected CartService $cartService;
    protected StockService $stockService;
    protected CouponService $couponService;
    protected InvoiceService $invoiceService;
    protected OrderService $orderService;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users
        $this->customer = User::factory()->create(['role' => 'customer']);
        $this->merchant = User::factory()->create(['role' => 'merchant']);

        // Create category and product
        $this->category = Category::factory()->create(['user_id' => $this->merchant->id]);
        $this->product = Product::factory()
            ->for($this->merchant)
            ->for($this->category)
            ->create(['price' => 100000]);

        // Create stock
        Stock::create([
            'product_id' => $this->product->id,
            'quantity' => 100,
        ]);

        // Create coupon
        $this->coupon = Coupon::factory()
            ->for($this->merchant, 'merchant')
            ->create([
                'code' => 'SAVE10',
                'type' => 'percentage',
                'value' => 10,
                'usage_limit' => 50,
                'is_active' => true,
            ]);

        // Initialize services
        $this->stockService = app(StockService::class);
        $this->cartService = app(CartService::class);
        $this->couponService = app(CouponService::class);
        $this->invoiceService = app(InvoiceService::class);
        $this->orderService = app(OrderService::class);
        $this->paymentService = app(PaymentService::class);
    }

    /** @test */
    public function can_add_items_to_cart()
    {
        $cartItem = $this->cartService->addItem($this->customer->id, $this->product->id, 2);

        $this->assertNotNull($cartItem);
        $this->assertEquals(2, $cartItem->quantity);
        $this->assertEquals(100000, $cartItem->price);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $totalItems = CartItem::where('cart_id', $cart->id)->sum('quantity');
        $totalPrice = CartItem::where('cart_id', $cart->id)->sum('subtotal');
        
        $this->assertEquals(2, $totalItems);
        $this->assertEquals(200000, $totalPrice);
    }

    /** @test */
    public function cannot_add_items_exceeding_stock()
    {
        $this->expectException(\Exception::class);
        $this->cartService->addItem($this->customer->id, $this->product->id, 150);
    }

    /** @test */
    public function can_update_cart_item_quantity()
    {
        $cartItem = $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $this->cartService->updateItem($cartItem->id, 5);

        $updatedItem = CartItem::find($cartItem->id);
        $this->assertEquals(5, $updatedItem->quantity);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $totalItems = CartItem::where('cart_id', $cart->id)->sum('quantity');
        $totalPrice = CartItem::where('cart_id', $cart->id)->sum('subtotal');
        
        $this->assertEquals(5, $totalItems);
        $this->assertEquals(500000, $totalPrice);
    }

    /** @test */
    public function can_remove_item_from_cart()
    {
        $cartItem = $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $this->cartService->removeItem($cartItem->id);

        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $this->assertEquals(0, $cart->total_items);
        $this->assertEquals(0, $cart->total_price);
    }

    /** @test */
    public function can_clear_entire_cart()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $this->cartService->addItem($this->customer->id, $this->product->id, 3);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $this->assertGreaterThan(0, $cart->items->count());

        $this->cartService->clear($this->customer->id);

        $cart->refresh();
        $this->assertEquals(0, $cart->items->count());
    }

    /** @test */
    public function can_validate_and_apply_coupon()
    {
        $validCoupon = $this->couponService->validate('SAVE10', $this->customer->id, 100000);
        $this->assertNotNull($validCoupon);
        $this->assertEquals('SAVE10', $validCoupon->code);
    }

    /** @test */
    public function cannot_validate_invalid_coupon()
    {
        $this->coupon->update(['is_active' => false]);
        $invalidCoupon = $this->couponService->validate('SAVE10', $this->customer->id, 100000);
        $this->assertNull($invalidCoupon);
    }

    /** @test */
    public function coupon_discount_calculation_percentage()
    {
        $discount = $this->couponService->calculateDiscount($this->coupon, 100000);
        $this->assertEquals(10000, $discount); // 10% of 100000
    }

    /** @test */
    public function coupon_respects_max_discount_limit()
    {
        $this->coupon->update(['max_discount' => 5000]);
        $discount = $this->couponService->calculateDiscount($this->coupon, 100000);
        $this->assertEquals(5000, $discount); // Capped at 5000
    }

    /** @test */
    public function can_create_order_from_cart()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 2);

        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_method_id' => null,
            'customer_address_id' => null,
            'shipping_cost' => 50000,
        ]);

        $this->assertNotNull($order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(1, $order->orderItems->count());
        $this->assertEquals(2, $order->orderItems->first()->quantity);

        $subtotal = 100000 * 2;
        $tax = $subtotal * 0.1;
        $total = $subtotal + $tax + 50000;
        $this->assertEquals($subtotal, $order->subtotal);
        $this->assertEquals($tax, $order->tax);
        $this->assertEquals($total, $order->total_price);
    }

    /** @test */
    public function stock_deducted_when_order_created()
    {
        $originalStock = Stock::where('product_id', $this->product->id)->first()->quantity;

        $this->cartService->addItem($this->customer->id, $this->product->id, 5);
        $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 50000,
        ]);

        $currentStock = Stock::where('product_id', $this->product->id)->first()->quantity;
        $this->assertEquals($originalStock - 5, $currentStock);

        // Verify stock history
        $history = StockHistory::where('product_id', $this->product->id)->first();
        $this->assertNotNull($history);
        $this->assertEquals('purchase', $history->reason);
    }

    /** @test */
    public function can_apply_coupon_to_order()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);

        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'coupon_code' => 'SAVE10',
            'shipping_cost' => 10000,
        ]);

        $this->assertEquals(10000, $order->discount_amount); // 10% of 100000
        $this->assertNotNull($order->couponUsage);
        $this->assertEquals(10000, $order->couponUsage->discount_amount);
    }

    /** @test */
    public function cart_cleared_after_order_created()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $cart = Cart::where('user_id', $this->customer->id)->first();
        $this->assertGreaterThan(0, $cart->items->count());

        $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $cart->refresh();
        $this->assertEquals(0, $cart->items->count());
    }

    /** @test */
    public function can_confirm_order()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->orderService->confirm($order);

        $order->refresh();
        $this->assertEquals('confirmed', $order->status);

        // Verify status history
        $history = OrderStatusHistory::where('order_id', $order->id)
            ->where('status', 'confirmed')
            ->first();
        $this->assertNotNull($history);
    }

    /** @test */
    public function can_ship_order()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->orderService->ship($order, 'TRK123456789');

        $order->refresh();
        $this->assertEquals('shipped', $order->status);
        $this->assertEquals('TRK123456789', $order->tracking_number);
        $this->assertNotNull($order->shipped_at);
    }

    /** @test */
    public function can_mark_order_as_delivered()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->orderService->ship($order);
        $this->orderService->deliver($order);

        $order->refresh();
        $this->assertEquals('delivered', $order->status);
        $this->assertNotNull($order->delivered_at);
    }

    /** @test */
    public function can_cancel_pending_order()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 3);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $stockBefore = Stock::where('product_id', $this->product->id)->first()->quantity;

        $this->orderService->cancel($order, 'Customer changed mind');

        $order->refresh();
        $this->assertEquals('cancelled', $order->status);

        $stockAfter = Stock::where('product_id', $this->product->id)->first()->quantity;
        $this->assertEquals($stockBefore + 3, $stockAfter); // Stock restored
    }

    /** @test */
    public function cannot_cancel_delivered_order()
    {
        $this->expectException(\Exception::class);
        
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->orderService->ship($order);
        $this->orderService->deliver($order);
        $this->orderService->cancel($order);
    }

    /** @test */
    public function invoice_generated_on_order_creation()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $invoice = Invoice::where('order_id', $order->id)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals('draft', $invoice->status);
        $this->assertStringStartsWith('INV-', $invoice->invoice_number);
    }

    /** @test */
    public function invoice_contains_correct_totals()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 20000,
        ]);

        $invoice = $order->invoice;
        $subtotal = 100000 * 2;
        $tax = $subtotal * 0.1;
        $total = $subtotal + $tax + 20000;

        $this->assertEquals($subtotal, $invoice->subtotal);
        $this->assertEquals($tax, $invoice->tax);
        $this->assertEquals(20000, $invoice->shipping_cost);
        $this->assertEquals($total, $invoice->total);
    }

    /** @test */
    public function can_create_payment_for_order()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $payment = $this->paymentService->createPayment($order, [
            'payment_method' => 'transfer',
        ]);

        $this->assertNotNull($payment);
        $this->assertEquals('pending', $payment->status);
        $this->assertEquals($order->total_price, $payment->amount);
    }

    /** @test */
    public function can_mark_payment_as_completed()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $payment = $this->paymentService->createPayment($order, [
            'payment_method' => 'transfer',
        ]);

        $this->paymentService->markAsCompleted($payment);

        $payment->refresh();
        $order->refresh();
        $this->assertEquals('completed', $payment->status);
        $this->assertEquals('confirmed', $order->status);
    }

    /** @test */
    public function transaction_logged_on_order_creation()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $transaction = TransactionLog::where('order_id', $order->id)->first();
        $this->assertNotNull($transaction);
        $this->assertEquals('order', $transaction->type);
        $this->assertEquals($order->total_price, $transaction->amount);
    }

    /** @test */
    public function transaction_logged_on_payment_completion()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $payment = $this->paymentService->createPayment($order, [
            'payment_method' => 'transfer',
        ]);

        $this->paymentService->markAsCompleted($payment);

        $transaction = TransactionLog::where('payment_id', $payment->id)
            ->where('type', 'deposit')
            ->first();
        $this->assertNotNull($transaction);
    }

    /** @test */
    public function stock_check_shows_low_stock()
    {
        Stock::where('product_id', $this->product->id)->update(['quantity' => 5]);

        $hasLowStock = $this->stockService->hasLowStock($this->product->id, 10);
        $this->assertTrue($hasLowStock);
    }

    /** @test */
    public function can_refund_payment()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $payment = $this->paymentService->createPayment($order, [
            'payment_method' => 'transfer',
        ]);

        $this->paymentService->markAsCompleted($payment);
        $this->paymentService->refund($payment, null, 'Customer requested');

        $payment->refresh();
        $this->assertEquals('refunded', $payment->status);
        $this->assertEquals($order->total_price, $payment->refunded_amount);
    }

    /** @test */
    public function coupon_usage_incremented_on_order_creation()
    {
        $initialUsage = $this->coupon->used_count;

        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'coupon_code' => 'SAVE10',
            'shipping_cost' => 10000,
        ]);

        $this->coupon->refresh();
        $this->assertEquals($initialUsage + 1, $this->coupon->used_count);
    }

    /** @test */
    public function coupon_usage_reverted_on_order_cancellation()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'coupon_code' => 'SAVE10',
            'shipping_cost' => 10000,
        ]);

        $this->coupon->refresh();
        $usageAfterOrder = $this->coupon->used_count;

        $this->orderService->cancel($order);

        $this->coupon->refresh();
        $this->assertEquals($usageAfterOrder - 1, $this->coupon->used_count);
    }

    /** @test */
    public function can_get_user_orders()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order1 = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->cartService->addItem($this->customer->id, $this->product->id, 2);
        $order2 = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $orders = $this->orderService->getUserOrders($this->customer->id);

        $this->assertEquals(2, $orders->total());
    }

    /** @test */
    public function can_filter_user_orders_by_status()
    {
        $this->cartService->addItem($this->customer->id, $this->product->id, 1);
        $order = $this->orderService->createFromCart($this->customer->id, $this->merchant->id, [
            'shipping_cost' => 10000,
        ]);

        $this->orderService->confirm($order);

        $pendingOrders = $this->orderService->getUserOrders($this->customer->id, ['status' => 'pending']);
        $confirmedOrders = $this->orderService->getUserOrders($this->customer->id, ['status' => 'confirmed']);

        $this->assertEquals(0, $pendingOrders->total());
        $this->assertEquals(1, $confirmedOrders->total());
    }
}
