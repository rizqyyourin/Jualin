<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer
            $table->foreignId('merchant_id')->constrained('users')->onDelete('cascade'); // Seller
            $table->string('order_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('shipping_status', ['pending', 'shipped', 'in_transit', 'delivered'])->default('pending');

            // Pricing
            $table->decimal('subtotal', 12, 2)->default(0); // Sum dari items
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);

            // Payment & Shipping info
            $table->string('payment_method')->nullable(); // bank_transfer, credit_card, e_wallet, cod
            $table->string('shipping_method')->nullable();
            $table->json('shipping_address')->nullable(); // Full address as JSON

            // Notes
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();

            // Dates
            $table->timestamp('expires_at')->nullable(); // Payment deadline
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('merchant_id');
            $table->index('order_number');
            $table->index('status');
            $table->index('payment_status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
