<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_id',
        'merchant_id',
        'invoice_number',
        'status',
        'subtotal',
        'tax',
        'discount',
        'shipping_cost',
        'total',
        'issue_date',
        'due_date',
        'paid_date',
        'items',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'paid_date' => 'date',
        'items' => 'json',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . date('Ymd') . '-';
        $latest = self::where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($latest) {
            $number = (int) substr($latest->invoice_number, -6) + 1;
        } else {
            $number = 1;
        }

        return $prefix . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_date' => now()->toDateString(),
        ]);
    }
}

