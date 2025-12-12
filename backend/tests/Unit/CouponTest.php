<?php

namespace Tests\Unit;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    protected User $merchant;
    protected Coupon $coupon;

    protected function setUp(): void
    {
        parent::setUp();
        $this->merchant = User::factory()->create(['role' => 'merchant']);
    }

    /** @test */
    public function coupon_can_be_created()
    {
        $coupon = Coupon::factory()->create(['merchant_id' => $this->merchant->id]);

        $this->assertNotNull($coupon);
        $this->assertEquals($this->merchant->id, $coupon->merchant_id);
    }

    /** @test */
    public function coupon_is_valid_within_date_range()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
            'is_active' => true,
        ]);

        $this->assertTrue($coupon->isValid());
    }

    /** @test */
    public function coupon_is_invalid_before_start_date()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'start_date' => now()->addDay(),
            'is_active' => true,
        ]);

        $this->assertFalse($coupon->isValid());
    }

    /** @test */
    public function coupon_is_invalid_after_end_date()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'start_date' => now()->subDays(2),
            'end_date' => now()->subDay(),
            'is_active' => true,
        ]);

        $this->assertFalse($coupon->isValid());
    }

    /** @test */
    public function coupon_is_invalid_when_inactive()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'is_active' => false,
        ]);

        $this->assertFalse($coupon->isValid());
    }

    /** @test */
    public function coupon_is_invalid_when_usage_limit_exceeded()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'usage_limit' => 5,
            'used_count' => 5,
            'is_active' => true,
        ]);

        $this->assertFalse($coupon->isValid());
    }

    /** @test */
    public function coupon_calculates_percentage_discount_correctly()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'type' => 'percentage',
            'value' => 10,
            'max_discount' => null, // No limit
        ]);

        $discount = $coupon->calculateDiscount(100000);
        $this->assertEquals(10000, $discount);
    }

    /** @test */
    public function coupon_calculates_fixed_discount_correctly()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'type' => 'fixed',
            'value' => 50000,
            'max_discount' => null, // No limit
        ]);

        $discount = $coupon->calculateDiscount(100000);
        $this->assertEquals(50000, $discount);
    }

    /** @test */
    public function coupon_respects_max_discount_limit()
    {
        $coupon = Coupon::factory()->create([
            'merchant_id' => $this->merchant->id,
            'type' => 'percentage',
            'value' => 20,
            'max_discount' => 30000,
        ]);

        $discount = $coupon->calculateDiscount(200000);
        $this->assertEquals(30000, $discount);
    }

    /** @test */
    public function coupon_has_relationship_to_merchant()
    {
        $coupon = Coupon::factory()->create(['merchant_id' => $this->merchant->id]);

        $this->assertNotNull($coupon->merchant());
        $this->assertEquals($this->merchant->id, $coupon->merchant->id);
    }

    /** @test */
    public function coupon_can_have_multiple_usages()
    {
        $coupon = Coupon::factory()->create(['merchant_id' => $this->merchant->id]);

        $coupon->increment('used_count', 3);
        $coupon->refresh();

        $this->assertEquals(3, $coupon->used_count);
    }
}
