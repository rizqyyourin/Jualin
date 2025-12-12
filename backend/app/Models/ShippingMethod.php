<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = [
        'merchant_id',
        'name',
        'code',
        'description',
        'base_cost',
        'calculation_type',
        'rates',
        'estimated_days',
        'is_active',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'rates' => 'json',
        'is_active' => 'boolean',
    ];

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function calculateCost($totalWeight = 0, $distance = 0)
    {
        $cost = $this->base_cost;

        if ($this->calculation_type === 'weight_based' && $totalWeight > 0) {
            $rates = $this->rates;
            foreach ($rates as $rate) {
                if ($totalWeight >= $rate['weight']) {
                    $cost += $rate['cost'];
                }
            }
        } elseif ($this->calculation_type === 'distance_based' && $distance > 0) {
            $rates = $this->rates;
            foreach ($rates as $rate) {
                if ($distance >= $rate['distance']) {
                    $cost += $rate['cost'];
                }
            }
        }

        return $cost;
    }
}

