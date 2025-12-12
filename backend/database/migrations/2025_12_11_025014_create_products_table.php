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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Merchant
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('discount_price', 12, 2)->nullable();
            $table->integer('discount_percent')->default(0);
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('dimensions')->nullable(); // Format: "L x W x H"
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->enum('status', ['active', 'draft', 'archived'])->default('draft');
            $table->enum('visibility', ['public', 'private'])->default('public');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraint
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            
            // Indexes
            $table->index('user_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
