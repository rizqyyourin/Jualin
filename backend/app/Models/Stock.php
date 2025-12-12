<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $fillable = [
        'product_id',
        'quantity',
        'reorder_level',
        'last_restocked_at',
    ];

    protected $casts = [
        'last_restocked_at' => 'datetime',
    ];

    /**
     * Get the product this stock belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Check if product is low in stock.
     */
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }

    /**
     * Check if product is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity <= 0;
    }
}
