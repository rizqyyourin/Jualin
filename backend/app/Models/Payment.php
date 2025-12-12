<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'payment_method',
        'status',
        'amount',
        'refunded_amount',
        'payment_gateway_id',
        'reference_number',
        'payment_details',
        'paid_at',
        'refunded_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'payment_details' => 'json',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isSuccess()
    {
        return $this->status === 'success';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }
}

