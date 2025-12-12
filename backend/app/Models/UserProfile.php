<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'avatar_url',
        'shop_name',
        'shop_slug',
        'shop_description',
        'shop_logo_url',
        'shop_banner_url',
        'shop_verified',
        'tax_id',
        'business_license',
    ];

    protected $casts = [
        'shop_verified' => 'boolean',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
