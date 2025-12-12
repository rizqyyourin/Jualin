<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('merchant_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('total_refund', 12, 2)->default(0);
            $table->integer('total_visitors')->default(0);
            $table->integer('total_products_sold')->default(0);
            $table->decimal('average_order_value', 12, 2)->default(0);
            $table->integer('returning_customers')->default(0);
            $table->json('top_products')->nullable();
            $table->json('traffic_source')->nullable();
            $table->timestamps();
            $table->unique(['merchant_id', 'date']);
            $table->index(['merchant_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchant_analytics');
    }
};
