<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function calculateTotals()
    {
        $subtotal = $this->items()->sum('subtotal');
        $this->subtotal = $subtotal;
        $this->total = $subtotal + $this->tax + $this->shipping_cost - $this->discount;
        $this->save();
    }
}

