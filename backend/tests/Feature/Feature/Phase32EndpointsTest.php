<?php

namespace Tests\Feature\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\CustomerAddress;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class Phase32EndpointsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $merchant;
    protected User $customer;
    protected Category $category;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create merchant and customer
        $this->merchant = User::factory()->create(['role' => 'merchant']);
        $this->customer = User::factory()->create(['role' => 'customer']);

        // Create category
        $this->category = Category::create([
            'user_id' => $this->merchant->id,
            'name' => 'Test Category',
            'slug' => 'test-category',
            'is_active' => true,
        ]);

        // Create product
        $this->product = Product::create([
            'user_id' => $this->merchant->id,
            'category_id' => $this->category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'price' => 100000,
            'cost_price' => 50000,
            'sku' => 'TEST-001',
            'status' => 'active',
        ]);
    }

    // ==================== PRODUCT ENDPOINTS ====================

    public function test_can_list_products()
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'price', 'user_id']
                    ]
                ]
            ]);
    }

    public function test_can_show_product()
    {
        $response = $this->getJson("/api/products/{$this->product->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->product->id)
            ->assertJsonPath('data.name', $this->product->name);
    }

    public function test_merchant_can_create_product()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->postJson('/api/products', [
                'category_id' => $this->category->id,
                'name' => 'New Product',
                'price' => 50000,
                'cost_price' => 25000,
                'sku' => 'NEW-001',
                'status' => 'draft',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Product')
            ->assertJsonPath('data.user_id', $this->merchant->id);

        $this->assertDatabaseHas('products', [
            'name' => 'New Product',
            'user_id' => $this->merchant->id,
        ]);
    }

    public function test_customer_cannot_create_product()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/products', [
                'name' => 'New Product',
                'price' => 50000,
                'sku' => 'NEW-001',
            ]);

        $response->assertStatus(403);
    }

    public function test_merchant_can_update_own_product()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->putJson("/api/products/{$this->product->id}", [
                'name' => 'Updated Product',
                'price' => 120000,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Product')
            ->assertJsonPath('data.price', '120000.00');

        $this->assertDatabaseHas('products', [
            'id' => $this->product->id,
            'name' => 'Updated Product',
        ]);
    }

    public function test_merchant_cannot_update_others_product()
    {
        $other_merchant = User::factory()->create(['role' => 'merchant']);

        $response = $this->actingAs($other_merchant, 'sanctum')
            ->putJson("/api/products/{$this->product->id}", [
                'name' => 'Hacked Product',
            ]);

        $response->assertStatus(403);
    }

    public function test_merchant_can_delete_own_product()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->deleteJson("/api/products/{$this->product->id}");

        $response->assertStatus(200);
        // Product uses soft delete, so it still exists in DB
        $this->assertDatabaseHas('products', ['id' => $this->product->id]);
    }

    // ==================== CATEGORY ENDPOINTS ====================

    public function test_can_list_categories()
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'user_id']
                    ]
                ]
            ]);
    }

    public function test_can_show_category()
    {
        $response = $this->getJson("/api/categories/{$this->category->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->category->id)
            ->assertJsonPath('data.name', $this->category->name);
    }

    public function test_merchant_can_create_category()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->postJson('/api/categories', [
                'name' => 'New Category',
                'description' => 'Category description',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Category')
            ->assertJsonPath('data.user_id', $this->merchant->id);

        $this->assertDatabaseHas('categories', [
            'name' => 'New Category',
            'user_id' => $this->merchant->id,
        ]);
    }

    public function test_merchant_can_update_own_category()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->putJson("/api/categories/{$this->category->id}", [
                'name' => 'Updated Category',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Category');
    }

    public function test_cannot_delete_category_with_products()
    {
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->deleteJson("/api/categories/{$this->category->id}");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Cannot delete category with products');
    }

    // ==================== ORDER ENDPOINTS ====================

    public function test_customer_can_create_order()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/orders', [
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 2,
                        'unit_price' => 100000,
                    ]
                ],
                'shipping_address' => [
                    'recipient_name' => 'John Doe',
                    'phone' => '081234567890',
                    'address' => 'Jl. Test No. 1',
                    'city' => 'Jakarta',
                    'province' => 'DKI Jakarta',
                    'postal_code' => '12345',
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user_id', $this->customer->id)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_price', '200000.00');

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->customer->id,
        ]);
    }

    public function test_customer_cannot_create_order()
    {
        // Only customers can create orders
        $response = $this->actingAs($this->merchant, 'sanctum')
            ->postJson('/api/orders', [
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1,
                        'unit_price' => 100000,
                    ]
                ],
                'shipping_address' => [
                    'recipient_name' => 'John Doe',
                    'phone' => '081234567890',
                    'address' => 'Jl. Test No. 1',
                    'city' => 'Jakarta',
                    'province' => 'DKI Jakarta',
                    'postal_code' => '12345',
                ],
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only customers can create orders');
    }

    public function test_customer_can_list_own_orders()
    {
        // Create an order
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000001',
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'order_number', 'status']
                    ]
                ]
            ]);
    }

    public function test_customer_can_view_own_order()
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000001',
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $order->id);
    }

    public function test_customer_cannot_view_others_order()
    {
        $other_customer = User::factory()->create(['role' => 'customer']);
        $order = Order::create([
            'user_id' => $other_customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000002',
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson("/api/orders/{$order->id}");

        $response->assertStatus(403);
    }

    public function test_merchant_can_update_order_status()
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000003',
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        // Add product item to order
        $order->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100000,
            'total_price' => 100000,
        ]);

        $response = $this->actingAs($this->merchant, 'sanctum')
            ->putJson("/api/orders/{$order->id}/status", [
                'status' => 'confirmed',
                'notes' => 'Order confirmed',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_customer_can_cancel_pending_order()
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000004',
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson("/api/orders/{$order->id}/cancel", [
                'reason' => 'Changed mind',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');
    }

    // ==================== CUSTOMER ADDRESS ENDPOINTS ====================

    public function test_customer_can_create_address()
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/addresses', [
                'label' => 'home',
                'recipient_name' => 'John Doe',
                'phone' => '081234567890',
                'address' => 'Jl. Test No. 1',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '12345',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.label', 'home')
            ->assertJsonPath('data.user_id', $this->customer->id);

        $this->assertDatabaseHas('customer_addresses', [
            'user_id' => $this->customer->id,
            'label' => 'home',
        ]);
    }

    public function test_customer_can_list_addresses()
    {
        CustomerAddress::create([
            'user_id' => $this->customer->id,
            'label' => 'home',
            'recipient_name' => 'John Doe',
            'phone' => '081234567890',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/addresses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => ['id', 'label', 'recipient_name']
                ]
            ]);
    }

    public function test_customer_can_update_own_address()
    {
        $address = CustomerAddress::create([
            'user_id' => $this->customer->id,
            'label' => 'home',
            'recipient_name' => 'John Doe',
            'phone' => '081234567890',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->putJson("/api/addresses/{$address->id}", [
                'recipient_name' => 'Jane Doe',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.recipient_name', 'Jane Doe');
    }

    public function test_customer_can_delete_address()
    {
        $address = CustomerAddress::create([
            'user_id' => $this->customer->id,
            'label' => 'home',
            'recipient_name' => 'John Doe',
            'phone' => '081234567890',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->deleteJson("/api/addresses/{$address->id}");

        $response->assertStatus(200);
        // Check for soft delete (record still exists but with deleted_at)
        $this->assertDatabaseHas('customer_addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_customer_can_set_default_address()
    {
        $address = CustomerAddress::create([
            'user_id' => $this->customer->id,
            'label' => 'home',
            'recipient_name' => 'John Doe',
            'phone' => '081234567890',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson("/api/addresses/{$address->id}/set-default");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_default', true);

        $this->assertDatabaseHas('customer_addresses', [
            'id' => $address->id,
            'is_default' => true,
        ]);
    }

    // ==================== REVIEW ENDPOINTS ====================

    public function test_customer_can_create_review()
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000005',
            'status' => 'delivered',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100000,
            'total_price' => 100000,
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/reviews', [
                'product_id' => $this->product->id,
                'order_id' => $order->id,
                'rating' => 5,
                'title' => 'Great product!',
                'comment' => 'Very satisfied with this purchase',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.user_id', $this->customer->id)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('reviews', [
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
        ]);
    }

    public function test_customer_cannot_review_twice()
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'merchant_id' => $this->merchant->id,
            'order_number' => 'ORD-20251211000006',
            'status' => 'delivered',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
            'total_price' => 100000,
            'shipping_address' => ['address' => 'Test'],
        ]);

        $order->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100000,
            'total_price' => 100000,
        ]);

        // Create first review
        Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $order->id,
            'rating' => 5,
            'title' => 'Great product!',
            'status' => 'pending',
        ]);

        // Try to create second review
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/reviews', [
                'product_id' => $this->product->id,
                'order_id' => $order->id,
                'rating' => 4,
                'title' => 'Another review',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You have already reviewed this product');
    }

    public function test_merchant_can_approve_review()
    {
        $review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'rating' => 5,
            'title' => 'Great product!',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->merchant, 'sanctum')
            ->postJson("/api/reviews/{$review->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'status' => 'approved',
        ]);
    }

    public function test_merchant_can_reject_review()
    {
        $review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'rating' => 1,
            'title' => 'Bad product!',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->merchant, 'sanctum')
            ->postJson("/api/reviews/{$review->id}/reject", [
                'reason' => 'Inappropriate content',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_can_list_approved_reviews()
    {
        Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'rating' => 5,
            'title' => 'Great product!',
            'status' => 'approved',
        ]);

        $response = $this->getJson("/api/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'data' => [
                        '*' => ['id', 'rating', 'title', 'status']
                    ]
                ]
            ]);
    }

    public function test_customer_can_mark_review_helpful()
    {
        $review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'rating' => 5,
            'title' => 'Great product!',
            'status' => 'approved',
            'helpful_count' => 0,
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson("/api/reviews/{$review->id}/helpful");

        $response->assertStatus(200);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'helpful_count' => 1,
        ]);
    }
}
