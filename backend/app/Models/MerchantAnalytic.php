<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantAnalytic extends Model
{
    protected $fillable = [
        'merchant_id',
        'date',
        'total_orders',
        'total_revenue',
        'total_refund',
        'total_visitors',
        'total_products_sold',
        'average_order_value',
        'returning_customers',
        'top_products',
        'traffic_source',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'total_refund' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'top_products' => 'json',
        'traffic_source' => 'json',
    ];

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function getNetRevenueAttribute()
    {
        return $this->total_revenue - $this->total_refund;
    }

    public function getConversionRateAttribute()
    {
        if ($this->total_visitors === 0) {
            return 0;
        }
        return ($this->total_orders / $this->total_visitors) * 100;
    }
}

