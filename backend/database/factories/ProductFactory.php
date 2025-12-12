<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->numberBetween(10000, 500000),
            'category_id' => Category::factory(),
            'user_id' => User::factory(),
            'sku' => $this->faker->unique()->word(),
            'status' => 'active',
            'visibility' => 'public',
            'is_featured' => false,
        ];
    }
}
