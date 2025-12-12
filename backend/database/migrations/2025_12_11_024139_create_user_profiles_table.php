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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // For all users
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Indonesia');
            $table->string('avatar_url')->nullable();
            
            // For merchants only
            $table->string('shop_name')->nullable();
            $table->string('shop_slug')->nullable()->unique();
            $table->text('shop_description')->nullable();
            $table->string('shop_logo_url')->nullable();
            $table->string('shop_banner_url')->nullable();
            $table->boolean('shop_verified')->default(false);
            
            // For business
            $table->string('tax_id')->nullable();
            $table->string('business_license')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
