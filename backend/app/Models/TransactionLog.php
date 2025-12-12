<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'order_id',
        'payment_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'json',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public static function log($userId, $type, $amount, $description = null, $metadata = null, $orderId = null, $paymentId = null): self
    {
        return self::create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'payment_id' => $paymentId,
            'type' => $type,
            'amount' => $amount,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}

