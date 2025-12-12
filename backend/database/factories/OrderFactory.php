<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(100000, 1000000);
        $tax = $subtotal * 0.1;
        $discount = fake()->numberBetween(0, (int)($subtotal * 0.1));
        $shippingCost = fake()->numberBetween(10000, 50000);
        $total = $subtotal + $tax - $discount + $shippingCost;

        return [
            'user_id' => User::factory(['role' => 'customer']),
            'merchant_id' => User::factory(['role' => 'merchant']),
            'order_number' => 'ORD-' . fake()->numerify('############'),
            'status' => fake()->randomElement(['pending', 'confirmed', 'shipped', 'delivered']),
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed']),
            'shipping_status' => fake()->randomElement(['pending', 'shipped', 'delivered']),
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'tax' => $tax,
            'discount_amount' => $discount,
            'total_price' => $total,
            'payment_method' => fake()->randomElement(['bank_transfer', 'credit_card', 'e_wallet', 'cod']),
            'shipping_method' => fake()->randomElement(['regular', 'express', 'same_day']),
            'shipping_address' => [
                'street' => fake()->address(),
                'city' => fake()->city(),
                'province' => fake()->state(),
                'postal_code' => fake()->postcode(),
            ],
            'customer_notes' => fake()->optional()->sentence(),
            'admin_notes' => fake()->optional()->sentence(),
            'expires_at' => now()->addDays(7),
            'shipped_at' => fake()->optional()->dateTime(),
            'delivered_at' => fake()->optional()->dateTime(),
            'cancelled_at' => fake()->optional()->dateTime(),
            'tracking_number' => fake()->optional()->numerify('TRK##########'),
        ];
    }
}
