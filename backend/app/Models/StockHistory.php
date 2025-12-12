<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockHistory extends Model
{
    protected $fillable = [
        'product_id',
        'quantity_before',
        'quantity_after',
        'reason',
        'reference_id',
        'notes',
        'created_by',
    ];

    /**
     * Get the product this history belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who made this change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Calculate quantity change.
     */
    public function getQuantityChangeAttribute(): int
    {
        return $this->quantity_after - $this->quantity_before;
    }
}
