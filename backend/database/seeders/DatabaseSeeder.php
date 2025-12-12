<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create merchant user
        $merchant = User::factory()->create([
            'name' => 'Tech Store Merchant',
            'email' => 'merchant@example.com',
            // Default password is usually 'password' in factories
        ]);

        // Create customer users (10 customers)
        $customers = User::factory(10)->create();

        // Create categories
        $categories = [
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Electronic devices and gadgets',
                'is_active' => true,
            ]),
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Audio & Headphones',
                'slug' => 'audio-headphones',
                'description' => 'Audio devices and headphones',
                'is_active' => true,
            ]),
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Computing',
                'slug' => 'computing',
                'description' => 'Computing and storage devices',
                'is_active' => true,
            ]),
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Peripherals',
                'slug' => 'peripherals',
                'description' => 'Computer peripherals and accessories',
                'is_active' => true,
            ]),
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Displays',
                'slug' => 'displays',
                'description' => 'Monitors and display devices',
                'is_active' => true,
            ]),
            Category::create([
                'user_id' => $merchant->id,
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Tech accessories and cables',
                'is_active' => true,
            ]),
        ];
    }
}
