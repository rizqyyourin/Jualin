<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'cost_price',
        'discount_price',
        'discount_percent',
        'weight',
        'dimensions',
        'sku',
        'barcode',
        'status',
        'visibility',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    /**
     * Get the merchant (user) that owns this product.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of this product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the images for this product.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get the stock for this product.
     */
    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class);
    }

    /**
     * Get the stock history for this product.
     */
    public function stockHistory(): HasMany
    {
        return $this->hasMany(StockHistory::class);
    }

    /**
     * Get the order items for this product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the reviews for this product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get primary image.
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Calculate final price with discount.
     */
    public function getFinalPriceAttribute(): float
    {
        if ($this->discount_price) {
            return (float) $this->discount_price;
        }

        if ($this->discount_percent > 0) {
            return (float) ($this->price - ($this->price * $this->discount_percent / 100));
        }

        return (float) $this->price;
    }

    /**
     * Get average rating.
     */
    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()
            ->where('status', 'approved')
            ->average('rating') ?? 0;
    }
}
