<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(100000, 1000000);
        $tax = $subtotal * 0.1;
        $discount = fake()->numberBetween(0, (int)($subtotal * 0.1));
        $shipping = fake()->numberBetween(10000, 50000);
        $total = $subtotal + $tax - $discount + $shipping;

        return [
            'order_id' => Order::factory(),
            'merchant_id' => User::factory(['role' => 'merchant']),
            'invoice_number' => function () {
                return \App\Models\Invoice::generateInvoiceNumber();
            },
            'status' => fake()->randomElement(['draft', 'sent', 'paid']),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'shipping_cost' => $shipping,
            'total' => $total,
            'issue_date' => now(),
            'due_date' => now()->addDays(7),
            'paid_date' => fake()->optional()->dateTime(),
            'items' => [
                [
                    'product_id' => 1,
                    'product_name' => fake()->word(),
                    'quantity' => fake()->numberBetween(1, 5),
                    'price' => fake()->numberBetween(10000, 100000),
                    'subtotal' => fake()->numberBetween(10000, 100000),
                ],
            ],
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
