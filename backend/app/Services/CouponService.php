<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;

class CouponService
{
    /**
     * Validate coupon and check if applicable.
     */
    public function validate(string $code, int $userId, float $cartTotal): ?Coupon
    {
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return null;
        }

        // Check if coupon is valid
        if (!$coupon->isValid()) {
            return null;
        }

        // Check per customer usage limit
        if ($coupon->per_customer_limit) {
            $usageCount = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $userId)
                ->count();

            if ($usageCount >= $coupon->per_customer_limit) {
                return null;
            }
        }

        // Check minimum purchase
        if ($coupon->min_purchase && $cartTotal < $coupon->min_purchase) {
            return null;
        }

        return $coupon;
    }

    /**
     * Calculate discount amount for a coupon.
     */
    public function calculateDiscount(Coupon $coupon, float $cartTotal): float
    {
        return $coupon->calculateDiscount($cartTotal);
    }

    /**
     * Apply coupon to order and create usage record.
     */
    public function apply(Coupon $coupon, int $orderId, int $userId, float $discountAmount): CouponUsage
    {
        // Increment usage count
        $coupon->increment('used_count');

        // Create usage record
        return CouponUsage::create([
            'coupon_id' => $coupon->id,
            'order_id' => $orderId,
            'user_id' => $userId,
            'discount_amount' => $discountAmount,
        ]);
    }

    /**
     * Revert coupon usage (on refund/cancellation).
     */
    public function revoke(CouponUsage $usage): void
    {
        $usage->coupon->decrement('used_count');
        $usage->delete();
    }
}
