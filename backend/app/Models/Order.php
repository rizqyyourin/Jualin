<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'merchant_id',
        'order_number',
        'status',
        'payment_status',
        'shipping_status',
        'subtotal',
        'shipping_cost',
        'tax',
        'discount_amount',
        'total_price',
        'payment_method',
        'shipping_method',
        'shipping_address',
        'customer_notes',
        'admin_notes',
        'expires_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'tracking_number',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'expires_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the customer (user) who placed this order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the merchant (seller) for this order.
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Alias for items relationship - Eloquent will resolve this through __get.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the order status history.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    /**
     * Get the order payment.
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the order invoice.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Get the coupon usage for this order.
     */
    public function couponUsage()
    {
        return $this->hasOne(CouponUsage::class);
    }

    /**
     * Get the shipping method.
     */
    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    /**
     * Get the customer address.
     */
    public function customerAddress(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class);
    }

    /**
     * Get the user relationship (alias for customer).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . date('Ymd');
        $latestOrder = self::where('order_number', 'like', $prefix . '%')
            ->orderBy('order_number', 'desc')
            ->first();

        if ($latestOrder) {
            $number = (int) substr($latestOrder->order_number, -6) + 1;
        } else {
            $number = 1;
        }

        return $prefix . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Update order status and record history.
     */
    public function updateStatus(string $status, ?string $notes = null, ?int $changedBy = null): void
    {
        $this->update(['status' => $status]);

        OrderStatusHistory::create([
            'order_id' => $this->id,
            'status' => $status,
            'notes' => $notes,
            'changed_by' => $changedBy,
        ]);
    }

    /**
     * Calculate total price.
     */
    public function calculateTotal(): void
    {
        $subtotal = $this->items()->sum('total_price');
        $this->update([
            'subtotal' => $subtotal,
            'total_price' => $subtotal + $this->shipping_cost + $this->tax - $this->discount_amount,
        ]);
    }
}
