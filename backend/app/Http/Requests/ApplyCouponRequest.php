<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'coupon_code' => ['required', 'string', 'exists:coupons,code'],
            'cart_total' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'coupon_code.required' => 'Coupon code is required',
            'coupon_code.exists' => 'Coupon code not found',
            'cart_total.required' => 'Cart total is required',
        ];
    }
}
