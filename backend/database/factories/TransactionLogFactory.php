<?php

namespace Database\Factories;

use App\Models\TransactionLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransactionLog>
 */
class TransactionLogFactory extends Factory
{
    protected $model = TransactionLog::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['deposit', 'withdrawal', 'order_refund', 'commission', 'adjustment']);
        $amount = fake()->numberBetween(10000, 1000000);
        $balanceBefore = fake()->numberBetween(0, 5000000);
        $balanceAfter = $type === 'withdrawal' 
            ? $balanceBefore - $amount 
            : $balanceBefore + $amount;

        return [
            'user_id' => User::factory(),
            'order_id' => null,
            'payment_id' => null,
            'type' => $type,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => max(0, $balanceAfter),
            'description' => fake()->sentence(),
            'metadata' => [
                'gateway' => fake()->randomElement(['stripe', 'midtrans', 'paypal', 'local']),
                'reference_id' => fake()->uuid(),
            ],
        ];
    }
}
