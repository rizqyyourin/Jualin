<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get user's orders (as customer).
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get merchant's orders (as seller).
     */
    public function merchantOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'merchant_id');
    }

    /**
     * Get user's addresses.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    /**
     * Get user's reviews.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get merchant's categories.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Get merchant's products.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get user's cart.
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get user's wishlist items.
     */
    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Get user's payments.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get merchant's shipping methods.
     */
    public function shippingMethods(): HasMany
    {
        return $this->hasMany(ShippingMethod::class, 'merchant_id');
    }

    /**
     * Get merchant's analytics.
     */
    public function analytics(): HasMany
    {
        return $this->hasMany(MerchantAnalytic::class, 'merchant_id');
    }

    /**
     * Get merchant's coupons.
     */
    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class, 'merchant_id');
    }

    /**
     * Get merchant's invoices.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'merchant_id');
    }

    /**
     * Get user's transaction logs.
     */
    public function transactionLogs(): HasMany
    {
        return $this->hasMany(TransactionLog::class);
    }

    /**
     * Get user's coupon usages.
     */
    public function couponUsages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Check if user is merchant.
     */
    public function isMerchant(): bool
    {
        return $this->role === 'merchant';
    }

    /**
     * Check if user is customer.
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
