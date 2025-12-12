<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\MerchantAnalytic;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase4EndpointsTest extends TestCase
{
    use RefreshDatabase;

    private $customer;
    private $merchant;
    private $admin;
    private $product;
    private $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->create(['role' => 'customer']);
        $this->merchant = User::factory()->create(['role' => 'merchant']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $category = Category::create([
            'user_id' => $this->merchant->id,
            'name' => 'Electronics',
            'slug' => 'electronics',
        ]);

        $this->product = Product::create([
            'user_id' => $this->merchant->id,
            'category_id' => $category->id,
            'name' => 'Test Laptop',
            'slug' => 'test-laptop',
            'description' => 'Test Description',
            'price' => 1000000,
            'sku' => 'LAPTOP-001',
            'is_featured' => false,
        ]);

        $this->order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-123456',
            'status' => 'pending',
            'total_price' => 1000000,
            'shipping_address' => ['address' => 'Test Address'],
            'notes' => 'Test Notes',
        ]);
    }

    // ===== CART TESTS =====

    public function test_customer_can_get_cart()
    {
        $response = $this->actingAs($this->customer)->getJson('/api/cart');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id', 'user_id', 'subtotal', 'tax', 'shipping_cost', 'discount', 'total', 'items'
            ],
        ]);
    }

    public function test_customer_can_add_item_to_cart()
    {
        $response = $this->actingAs($this->customer)->postJson('/api/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('message', 'Item added to cart successfully');
        $response->assertJsonPath('data.quantity', 2);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);
    }

    public function test_customer_cannot_add_invalid_product_to_cart()
    {
        $response = $this->actingAs($this->customer)->postJson('/api/cart/items', [
            'product_id' => 9999,
            'quantity' => 1,
        ]);

        $response->assertStatus(422);
    }

    public function test_customer_can_update_cart_item_quantity()
    {
        $cartItem = CartItem::create([
            'cart_id' => Cart::firstOrCreate(
                ['user_id' => $this->customer->id],
                ['user_id' => $this->customer->id]
            )->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'price' => $this->product->price,
            'subtotal' => $this->product->price,
        ]);

        $response = $this->actingAs($this->customer)->putJson("/api/cart/items/{$cartItem->id}", [
            'quantity' => 3,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.quantity', 3);
    }

    public function test_customer_can_remove_item_from_cart()
    {
        $cartItem = CartItem::create([
            'cart_id' => Cart::firstOrCreate(
                ['user_id' => $this->customer->id],
                ['user_id' => $this->customer->id]
            )->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'price' => $this->product->price,
            'subtotal' => $this->product->price,
        ]);

        $response = $this->actingAs($this->customer)->deleteJson("/api/cart/items/{$cartItem->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
    }

    public function test_customer_can_clear_cart()
    {
        Cart::firstOrCreate(
            ['user_id' => $this->customer->id],
            ['user_id' => $this->customer->id]
        );

        CartItem::create([
            'cart_id' => $this->customer->cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'price' => $this->product->price,
            'subtotal' => $this->product->price,
        ]);

        $response = $this->actingAs($this->customer)->deleteJson('/api/cart');

        $response->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', ['cart_id' => $this->customer->cart->id]);
    }

    public function test_customer_can_apply_discount_to_cart()
    {
        Cart::firstOrCreate(
            ['user_id' => $this->customer->id],
            ['user_id' => $this->customer->id]
        );

        $response = $this->actingAs($this->customer)->postJson('/api/cart/discount', [
            'discount_amount' => 100000,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.discount', '100000.00');
    }

    // ===== WISHLIST TESTS =====

    public function test_customer_can_get_wishlist()
    {
        Wishlist::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->customer)->getJson('/api/wishlist');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_customer_can_add_product_to_wishlist()
    {
        $response = $this->actingAs($this->customer)->postJson('/api/wishlist', [
            'product_id' => $this->product->id,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('message', 'Product added to wishlist successfully');

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);
    }

    public function test_customer_cannot_add_duplicate_wishlist_item()
    {
        Wishlist::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->customer)->postJson('/api/wishlist', [
            'product_id' => $this->product->id,
        ]);

        $response->assertStatus(409);
    }

    public function test_customer_can_remove_from_wishlist()
    {
        $wishlist = Wishlist::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->customer)->deleteJson("/api/wishlist/{$wishlist->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('wishlists', ['id' => $wishlist->id]);
    }

    public function test_customer_can_check_if_product_in_wishlist()
    {
        Wishlist::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->actingAs($this->customer)->postJson('/api/wishlist/check', [
            'product_id' => $this->product->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.in_wishlist', true);
    }

    // ===== PAYMENT TESTS =====

    public function test_customer_can_create_payment()
    {
        $response = $this->actingAs($this->customer)->postJson('/api/payments', [
            'order_id' => $this->order->id,
            'payment_method' => 'credit_card',
            'amount' => $this->order->total_price,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('message', 'Payment created successfully');
        $response->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'pending',
        ]);
    }

    public function test_customer_cannot_create_payment_for_others_order()
    {
        $otherCustomer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($otherCustomer)->postJson('/api/payments', [
            'order_id' => $this->order->id,
            'payment_method' => 'credit_card',
            'amount' => $this->order->total_price,
        ]);

        $response->assertStatus(403);
    }

    public function test_customer_can_get_payment_details()
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'payment_method' => 'credit_card',
            'status' => 'pending',
            'amount' => $this->order->total_price,
            'reference_number' => 'TEST-REF',
        ]);

        $response = $this->actingAs($this->customer)->getJson("/api/payments/{$payment->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.reference_number', 'TEST-REF');
    }

    public function test_customer_can_get_payment_by_order()
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'payment_method' => 'credit_card',
            'status' => 'pending',
            'amount' => $this->order->total_price,
            'reference_number' => 'TEST-REF',
        ]);

        $response = $this->actingAs($this->customer)->getJson("/api/orders/{$this->order->id}/payment");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $payment->id);
    }

    public function test_customer_can_confirm_payment()
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'payment_method' => 'credit_card',
            'status' => 'pending',
            'amount' => $this->order->total_price,
            'reference_number' => 'TEST-REF',
        ]);

        $response = $this->actingAs($this->customer)->postJson("/api/payments/{$payment->id}/confirm", [
            'payment_gateway_id' => 'GATEWAY-123',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'success',
        ]);
    }

    public function test_customer_can_refund_payment()
    {
        $payment = Payment::create([
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'payment_method' => 'credit_card',
            'status' => 'success',
            'amount' => $this->order->total_price,
            'reference_number' => 'TEST-REF',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($this->customer)->postJson("/api/payments/{$payment->id}/refund", [
            'reason' => 'Customer requested refund',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'refunded',
        ]);
    }

    // ===== SHIPPING TESTS =====

    public function test_merchant_can_get_shipping_methods()
    {
        ShippingMethod::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'JNE',
            'code' => 'JNE',
            'base_cost' => 50000,
            'calculation_type' => 'flat',
            'estimated_days' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->merchant)->getJson('/api/shipping-methods');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_merchant_can_create_shipping_method()
    {
        $response = $this->actingAs($this->merchant)->postJson('/api/shipping-methods', [
            'name' => 'GoSend',
            'code' => 'GOSEND-001',
            'base_cost' => 10000,
            'calculation_type' => 'flat',
            'estimated_days' => 1,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'GoSend');

        $this->assertDatabaseHas('shipping_methods', [
            'merchant_id' => $this->merchant->id,
            'name' => 'GoSend',
        ]);
    }

    public function test_customer_cannot_create_shipping_method()
    {
        $response = $this->actingAs($this->customer)->postJson('/api/shipping-methods', [
            'name' => 'GoSend',
            'code' => 'GOSEND-001',
            'base_cost' => 10000,
            'calculation_type' => 'flat',
            'estimated_days' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_merchant_can_update_shipping_method()
    {
        $method = ShippingMethod::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'JNE',
            'code' => 'JNE',
            'base_cost' => 50000,
            'calculation_type' => 'flat',
            'estimated_days' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->merchant)->putJson("/api/shipping-methods/{$method->id}", [
            'base_cost' => 60000,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('shipping_methods', [
            'id' => $method->id,
            'base_cost' => 60000,
        ]);
    }

    public function test_merchant_can_delete_shipping_method()
    {
        $method = ShippingMethod::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'JNE',
            'code' => 'JNE',
            'base_cost' => 50000,
            'calculation_type' => 'flat',
            'estimated_days' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->merchant)->deleteJson("/api/shipping-methods/{$method->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('shipping_methods', ['id' => $method->id]);
    }

    public function test_can_calculate_shipping_cost()
    {
        $method = ShippingMethod::create([
            'merchant_id' => $this->merchant->id,
            'name' => 'JNE',
            'code' => 'JNE',
            'base_cost' => 50000,
            'calculation_type' => 'flat',
            'estimated_days' => 3,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->customer)->postJson("/api/shipping-methods/{$method->id}/calculate", [
            'total_weight' => 1000,
            'distance' => 10,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.calculated_cost', '50000.00');
    }

    // ===== MERCHANT ANALYTICS TESTS =====

    public function test_merchant_can_get_dashboard()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/analytics/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'today' => ['orders', 'revenue', 'visitors'],
                'this_month' => ['revenue'],
                'total' => ['products', 'customers'],
            ],
        ]);
    }

    public function test_merchant_can_get_sales_analytics()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/analytics/sales');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_merchant_can_get_top_products()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/analytics/top-products');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_merchant_can_get_customer_insights()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/analytics/customers');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_customers',
                'returning_customers',
                'average_order_value',
                'top_customers',
            ],
        ]);
    }

    public function test_merchant_can_record_daily_analytics()
    {
        $response = $this->actingAs($this->merchant)->postJson('/api/analytics/record-daily', [
            'merchant_id' => $this->merchant->id,
            'date' => today()->toDateString(),
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('merchant_analytics', [
            'merchant_id' => $this->merchant->id,
        ]);
    }

    public function test_customer_cannot_access_analytics()
    {
        $response = $this->actingAs($this->customer)->getJson('/api/analytics/dashboard');

        $response->assertStatus(403);
    }

    // ===== ADMIN TESTS =====

    public function test_admin_can_list_users()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'pagination' => ['current_page', 'per_page', 'total', 'last_page'],
        ]);
    }

    public function test_admin_can_get_user_details()
    {
        $response = $this->actingAs($this->admin)->getJson("/api/admin/users/{$this->customer->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $this->customer->id);
    }

    public function test_admin_can_update_user_status()
    {
        $response = $this->actingAs($this->admin)->putJson(
            "/api/admin/users/{$this->customer->id}/status",
            ['is_active' => false]
        );

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->customer->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_update_user_role()
    {
        $response = $this->actingAs($this->admin)->putJson(
            "/api/admin/users/{$this->customer->id}/role",
            ['role' => 'merchant']
        );

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->customer->id,
            'role' => 'merchant',
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $userToDelete = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($this->admin)->deleteJson(
            "/api/admin/users/{$userToDelete->id}"
        );

        $response->assertStatus(200);
        // User uses SoftDeletes, verify the user is soft-deleted
        $this->assertTrue($userToDelete->fresh()->trashed());
    }

    public function test_admin_cannot_delete_own_account()
    {
        $response = $this->actingAs($this->admin)->deleteJson(
            "/api/admin/users/{$this->admin->id}"
        );

        $response->assertStatus(400);
    }

    public function test_admin_can_get_statistics()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/statistics');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'total_users',
                'merchants',
                'customers',
                'admins',
                'active_users',
                'inactive_users',
            ],
        ]);
    }

    public function test_admin_can_search_products()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/products?query=laptop');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'pagination']);
    }

    public function test_customer_cannot_access_admin_endpoints()
    {
        $response = $this->actingAs($this->customer)->getJson('/api/admin/users');

        $response->assertStatus(403);
    }
}
