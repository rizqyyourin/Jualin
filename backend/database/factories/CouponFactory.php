<?php

namespace Database\Factories;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->word(),
            'type' => 'percentage',
            'value' => $this->faker->numberBetween(5, 50),
            'min_purchase' => $this->faker->numberBetween(10000, 100000),
            'max_discount' => $this->faker->numberBetween(10000, 50000),
            'usage_limit' => $this->faker->numberBetween(10, 100),
            'used_count' => 0,
            'per_customer_limit' => $this->faker->numberBetween(1, 5),
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
            'merchant_id' => User::factory(),
        ];
    }
}
