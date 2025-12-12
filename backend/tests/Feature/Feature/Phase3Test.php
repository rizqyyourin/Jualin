<?php

namespace Tests\Feature\Feature;

use App\Models\Category;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\Stock;
use App\Models\StockHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3Test extends TestCase
{
    use RefreshDatabase;

    /**
     * Test category creation and relationships.
     */
    public function test_category_can_be_created_with_merchant(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $category = Category::create([
            'user_id' => $merchant->id,
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic devices',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'user_id' => $merchant->id,
            'name' => 'Electronics',
        ]);

        $this->assertTrue($category->user->is($merchant));
    }

    /**
     * Test product creation with category and merchant.
     */
    public function test_product_can_be_created(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $category = Category::create([
            'user_id' => $merchant->id,
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'category_id' => $category->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'description' => 'High performance laptop',
            'price' => 1000.00,
            'cost_price' => 800.00,
            'sku' => 'LAP-001',
            'status' => 'active',
            'is_featured' => true,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $this->assertTrue($product->category->is($category));
        $this->assertTrue($product->user->is($merchant));
    }

    /**
     * Test product images can be added.
     */
    public function test_product_can_have_images(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'price' => 1000.00,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $image1 = ProductImage::create([
            'product_id' => $product->id,
            'image_url' => 'https://example.com/image1.jpg',
            'is_primary' => true,
            'sort_order' => 1,
        ]);

        $image2 = ProductImage::create([
            'product_id' => $product->id,
            'image_url' => 'https://example.com/image2.jpg',
            'is_primary' => false,
            'sort_order' => 2,
        ]);

        $this->assertCount(2, $product->images);
        $this->assertTrue($product->primaryImage->is($image1));
    }

    /**
     * Test stock management.
     */
    public function test_stock_can_be_managed(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'price' => 1000.00,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $stock = Stock::create([
            'product_id' => $product->id,
            'quantity' => 100,
            'reorder_level' => 20,
        ]);

        $this->assertFalse($stock->isLowStock());
        $this->assertFalse($stock->isOutOfStock());

        // Update stock to low
        $stock->update(['quantity' => 15]);
        $this->assertTrue($stock->isLowStock());
    }

    /**
     * Test stock history tracking.
     */
    public function test_stock_history_can_be_tracked(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'price' => 1000.00,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $history = StockHistory::create([
            'product_id' => $product->id,
            'quantity_before' => 100,
            'quantity_after' => 95,
            'reason' => 'purchase',
            'reference_id' => 'ORD-001',
            'created_by' => $merchant->id,
        ]);

        $this->assertEquals(-5, $history->quantity_change);
        $this->assertTrue($history->product->is($product));
    }

    /**
     * Test order creation.
     */
    public function test_order_can_be_created(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $order = Order::create([
            'user_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => 1000.00,
            'total_price' => 1050.00,
        ]);

        $this->assertTrue($order->customer->is($customer));
        $this->assertTrue($order->merchant->is($merchant));
        $this->assertStringStartsWith('ORD-', $order->order_number);
    }

    /**
     * Test order items.
     */
    public function test_order_items_can_be_added(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'price' => 1000.00,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $order = Order::create([
            'user_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 1000.00,
            'total_price' => 2000.00,
        ]);

        $this->assertCount(1, $order->items);
        $this->assertTrue($item->product->is($product));
    }

    /**
     * Test order status history.
     */
    public function test_order_status_can_be_updated_with_history(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $order = Order::create([
            'user_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
        ]);

        $order->updateStatus('confirmed', 'Payment received', $merchant->id);

        $this->assertEquals('confirmed', $order->status);
        $this->assertCount(1, $order->statusHistory);
        $this->assertEquals('confirmed', $order->statusHistory->first()->status);
    }

    /**
     * Test customer address.
     */
    public function test_customer_can_have_addresses(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $address1 = CustomerAddress::create([
            'user_id' => $customer->id,
            'label' => 'home',
            'recipient_name' => 'John Doe',
            'phone' => '0812345678',
            'address' => '123 Main Street',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
            'is_default' => true,
        ]);

        $address2 = CustomerAddress::create([
            'user_id' => $customer->id,
            'label' => 'office',
            'recipient_name' => 'John Doe',
            'phone' => '0812345678',
            'address' => '456 Office Ave',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12346',
            'is_default' => false,
        ]);

        $this->assertCount(2, $customer->addresses ?? []);
        $this->assertTrue($address1->is_default);
        $this->assertFalse($address2->is_default);
    }

    /**
     * Test product review.
     */
    public function test_product_can_have_reviews(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'price' => 1000.00,
            'sku' => 'LAP-001',
            'status' => 'active',
        ]);

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'rating' => 5,
            'title' => 'Great Product',
            'comment' => 'Excellent quality',
            'status' => 'approved',
        ]);

        $this->assertCount(1, $product->reviews);
        $this->assertEquals(5, $review->rating);
    }

    /**
     * Test product final price calculation.
     */
    public function test_product_final_price_calculation(): void
    {
        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $product1 = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Product 1',
            'slug' => 'product-1',
            'price' => 100.00,
            'discount_percent' => 10,
            'sku' => 'PROD-001',
            'status' => 'active',
        ]);

        $product2 = Product::create([
            'user_id' => $merchant->id,
            'name' => 'Product 2',
            'slug' => 'product-2',
            'price' => 100.00,
            'discount_price' => 80.00,
            'sku' => 'PROD-002',
            'status' => 'active',
        ]);

        $this->assertEquals(90.00, $product1->final_price);
        $this->assertEquals(80.00, $product2->final_price);
    }

    /**
     * Test order number generation.
     */
    public function test_order_number_is_unique(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $merchant = User::create([
            'name' => 'Test Merchant',
            'email' => 'merchant@example.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
            'is_active' => true,
        ]);

        $order1 = Order::create([
            'user_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
        ]);

        $order2 = Order::create([
            'user_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'order_number' => Order::generateOrderNumber(),
            'status' => 'pending',
        ]);

        $this->assertNotEquals($order1->order_number, $order2->order_number);
    }
}
